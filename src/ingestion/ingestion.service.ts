import { Injectable } from '@nestjs/common';
import { PdfParserService } from './pdf-parser/pdf-parser.service';
import { ChunkerService } from './chunker/chunker.service';
import { LawService } from 'src/law/law.service';

@Injectable()
export class IngestionService {
  constructor(
    private law: LawService,
    private pdfParser: PdfParserService,
    private chunker: ChunkerService,
  ) {}

  async store() {
    const text = await this.pdfParser.parsePdf();
    const articles = this.chunker.splitArticles(text);
    for (let i = 0; i < articles.length; i++) {
      await this.law.createLaw(
        'The Constitution',
        articles[i],
        'The_constitution.pdf',
        `Article ${i + 1}`,
      );
    }
    return {
      message: 'Ingestion completed successfully',
      totalArticles: articles.length,
    };
  }
}
