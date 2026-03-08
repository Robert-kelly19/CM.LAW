import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkerService {
  private static readonly CHUNK_SIZE = 800;

  /**
   * Splits text into chunks of approximately 800 words each,
   * preserving article headers using regex match/iteration.
   * @param text The text to split into articles/chunks
   * @returns Array of text chunks with headers preserved
   */
  splitArticles(text: string): string[] {
    // Handle empty or whitespace-only input
    if (!text || !text.trim()) {
      return [];
    }

    const chunks: string[] = [];

    // Pattern matches "Article X" header and captures everything up to next header
    // Uses matchAll to iterate over all matches and preserve headers
    const articleRegex =
      /(Article\s+\d+[^\n]*\n?)([\s\S]*?)(?=(?:Article\s+\d+)|$)/gi;

    const matches = [...text.matchAll(articleRegex)];

    if (matches.length === 0) {
      // No articles found - treat entire text as a single chunk or split by word count
      return this.splitIntoChunks(text.trim());
    }

    // Check for preamble (text before first article)
    const firstMatch = matches[0];
    const preambleStart = text.indexOf(firstMatch[0]);
    if (preambleStart > 0) {
      const preamble = text.substring(0, preambleStart).trim();
      if (preamble.length > 0) {
        const preambleChunks = this.splitIntoChunks(preamble);
        chunks.push(...preambleChunks);
      }
    }

    // Process each article
    for (const match of matches) {
      const header = match[1];
      const body = match[2];
      const fullArticle = header + body;

      const wordCount = this.countWords(fullArticle);

      if (wordCount <= ChunkerService.CHUNK_SIZE) {
        // Article fits in single chunk
        chunks.push(fullArticle.trim());
      } else {
        // Split long article into multiple chunks, preserving header in first chunk
        const headerWordCount = this.countWords(header);
        let availableWords = ChunkerService.CHUNK_SIZE - headerWordCount;
        const bodyWords = body.trim().split(/\s+/);

        let remainingWords = bodyWords;
        while (remainingWords.length > 0) {
          const chunkBody = remainingWords.slice(0, availableWords);
          remainingWords = remainingWords.slice(availableWords);

          const chunk = header + ' ' + chunkBody.join(' ');
          chunks.push(chunk.trim());

          // Reset for subsequent chunks (no header needed)
          availableWords = ChunkerService.CHUNK_SIZE;
        }
      }
    }

    return chunks.filter((chunk) => chunk.length > 0);
  }

  /**
   * Split text into chunks of approximately 800 words without header preservation
   */
  private splitIntoChunks(text: string): string[] {
    const words = text.split(/\s+/);

    if (words.length <= ChunkerService.CHUNK_SIZE) {
      return [text];
    }

    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += ChunkerService.CHUNK_SIZE) {
      const chunk = words.slice(i, i + ChunkerService.CHUNK_SIZE).join(' ');
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}
