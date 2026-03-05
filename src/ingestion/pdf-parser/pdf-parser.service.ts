import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  async parsePdf(): Promise<string> {
    try {
      const filePath = path.join(process.cwd(), 'pdfs', 'The_constitution.pdf');

      const dataBuffer = await fs.promises.readFile(filePath);

      const parser = new PDFParse({ data: dataBuffer });

      const result = await parser.getText();

      this.logger.log('PDF parsed successfully');

      return result.text;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Error reading PDF file', error.stack);
        throw error;
      }

      throw new Error('Unknown error reading PDF file');
    }
  }
}
