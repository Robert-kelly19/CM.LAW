import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LawService {
  constructor(private prisma: PrismaService) {}

  async createLaw(
    lawName: string,
    content: string,
    source: string,
    articleNumber: string,
  ) {
    return this.prisma.lawSection.create({
      data: {
        lawName,
        articleNumber,
        content,
        source,
      },
    });
  }

  async getAllLaws() {
    return this.prisma.lawSection.findMany();
  }
}
