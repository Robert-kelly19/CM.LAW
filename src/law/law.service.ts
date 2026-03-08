import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LawService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new law section with optional precomputed embedding.
   * @param lawName - The name of the law
   * @param content - The content of the law section
   * @param source - The source file
   * @param articleNumber - The article number
   * @param embedding - Optional precomputed embedding vector (1536 dimensions)
   */
  async createLaw(
    lawName: string,
    content: string,
    source: string,
    articleNumber: string,
    embedding?: number[],
  ) {
    return this.prisma.lawSection.create({
      data: {
        lawName,
        articleNumber,
        content,
        source,
        embedding: embedding as never, // Cast to unsupported type for vector
      },
    });
  }

  /**
   * Get all law sections.
   */
  async getAllLaws() {
    return this.prisma.lawSection.findMany();
  }

  /**
   * Search for similar laws using cosine similarity on embeddings.
   * Uses pgvector's cosine distance operator for similarity search.
   * @param queryEmbedding - The embedding vector for the query (1536 dimensions)
   * @param limit - Maximum number of results to return (default: 10)
   */
  async searchByContent(queryEmbedding: number[], limit: number = 10) {
    // Use raw query with pgvector cosine similarity
    // The <=> operator is the cosine distance operator in pgvector
    const embeddingVector = `[${queryEmbedding.join(',')}]`;

    const sql = Prisma.sql`
      SELECT 
        id,
        law_name as "lawName",
        "articleNumber",
        content,
        source,
        1 - (embedding <=> ${Prisma.raw(embeddingVector)}::vector) as similarity
      FROM law_sections
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${Prisma.raw(embeddingVector)}::vector
      LIMIT ${limit}
    `;

    const results = await this.prisma.$queryRaw<
      Array<{
        id: string;
        lawName: string;
        articleNumber: string;
        content: string;
        source: string;
        similarity: number;
      }>
    >(sql);

    return results;
  }

  /**
   * Find laws by exact article number.
   * @param articleNumber - The article number to search for
   */
  async findByArticle(articleNumber: string) {
    return this.prisma.lawSection.findMany({
      where: {
        articleNumber,
      },
    });
  }

  /**
   * Find laws by law name.
   * @param lawName - The law name to search for
   */
  async findByLawName(lawName: string) {
    return this.prisma.lawSection.findMany({
      where: {
        lawName: {
          contains: lawName,
          mode: 'insensitive',
        },
      },
    });
  }
}
