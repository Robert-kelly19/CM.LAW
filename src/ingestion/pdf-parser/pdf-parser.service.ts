import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  /**
   * Parse a PDF file and extract its text content.
   * @param filePath - The path to the PDF file (relative or absolute)
   * @returns The extracted text content from the PDF
   */
  async parsePdf(filePath: string): Promise<string> {
    try {
      // Resolve to absolute path if relative
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      const dataBuffer = await fs.promises.readFile(absolutePath);

      const parser = new PDFParse({ data: dataBuffer });

      const result = await parser.getText();

      this.logger.log(`PDF parsed successfully: ${filePath}`);

      return result.text;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error reading PDF file: ${filePath}`, error.stack);
        throw error;
      }

      throw new Error('Unknown error reading PDF file');
    }
  }
}
