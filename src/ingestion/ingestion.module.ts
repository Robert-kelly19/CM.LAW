import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { PdfParserService } from './pdf-parser/pdf-parser.service';
import { ChunkerService } from './chunker/chunker.service';
import { LawModule } from 'src/law/law.module';

@Module({
  imports: [LawModule],
  providers: [IngestionService, PdfParserService, ChunkerService],
  exports: [IngestionService],
})
export class IngestionModule {}
