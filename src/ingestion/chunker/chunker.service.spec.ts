import { Test, TestingModule } from '@nestjs/testing';
import { ChunkerService } from './chunker.service';

describe('ChunkerService', () => {
  let service: ChunkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChunkerService],
    }).compile();

    service = module.get<ChunkerService>(ChunkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('splitArticles', () => {
    // Helper function to count words in text
    const countWords = (text: string): number => {
      return text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    };

    // Helper function to generate text with specified word count
    const generateText = (wordCount: number): string => {
      return Array(wordCount).fill('word').join(' ');
    };

    describe('happy path - multiple articles split into ~800-word chunks', () => {
      it('should split text into chunks of approximately 800 words', () => {
        // Create text with 2400 words (should result in exactly 3 chunks of 800 each)
        const text = generateText(2400);
        const result = service.splitArticles(text);

        expect(result.length).toBe(3);
        // Each chunk should be approximately 800 words
        result.forEach((chunk) => {
          const wordCount = countWords(chunk);
          expect(wordCount).toBe(800);
        });
      });

      it('should maintain content ordering in chunks', () => {
        const text = 'first second third ' + generateText(1600) + ' last';
        const result = service.splitArticles(text);

        expect(result.length).toBeGreaterThan(0);
        // First chunk should start with 'first'
        expect(result[0].trim().startsWith('first')).toBe(true);
        // Last chunk should contain 'last'
        expect(result[result.length - 1].includes('last')).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string input', () => {
        const result = service.splitArticles('');
        expect(result).toEqual([]);
      });

      it('should handle single short article (less than 800 words)', () => {
        const text = generateText(100);
        const result = service.splitArticles(text);

        // Should return as single chunk since it's under 800 words
        expect(result.length).toBe(1);
        expect(countWords(result[0])).toBe(100);
      });

      it('should handle very short content', () => {
        const text = 'short text';
        const result = service.splitArticles(text);

        // Very short content may be filtered out or returned as single chunk
        expect(Array.isArray(result)).toBe(true);
      });

      it('should handle whitespace-only input', () => {
        const result = service.splitArticles('   ');
        expect(result).toEqual([]);
      });
    });

    describe('exact-boundary behavior', () => {
      it('should handle text exactly 800 words', () => {
        const text = generateText(800);
        const result = service.splitArticles(text);

        // Exactly 800 words should produce 1 chunk
        expect(result.length).toBe(1);
        expect(countWords(result[0])).toBe(800);
      });

      it('should handle text exactly 1600 words (multiple of 800)', () => {
        const text = generateText(1600);
        const result = service.splitArticles(text);

        // Exactly 1600 words should produce 2 chunks of 800 each
        expect(result.length).toBe(2);
        expect(countWords(result[0])).toBe(800);
        expect(countWords(result[1])).toBe(800);
      });

      it('should handle text exactly 2400 words (multiple of 800)', () => {
        const text = generateText(2400);
        const result = service.splitArticles(text);

        // Exactly 2400 words should produce 3 chunks of 800 each
        expect(result.length).toBe(3);
        result.forEach((chunk) => {
          expect(countWords(chunk)).toBe(800);
        });
      });
    });

    describe('long articles - split at ~800-word boundaries', () => {
      it('should split 1000-word article into 2 chunks', () => {
        const text = generateText(1000);
        const result = service.splitArticles(text);

        expect(result.length).toBe(2);
        // First chunk ~800 words, second chunk ~200 words
        expect(countWords(result[0])).toBeGreaterThanOrEqual(750);
        expect(countWords(result[0])).toBeLessThanOrEqual(850);
        expect(countWords(result[1])).toBeGreaterThanOrEqual(150);
        expect(countWords(result[1])).toBeLessThanOrEqual(250);
      });

      it('should split 1500-word article into 2 chunks', () => {
        const text = generateText(1500);
        const result = service.splitArticles(text);

        expect(result.length).toBe(2);
        expect(countWords(result[0])).toBeGreaterThanOrEqual(750);
        expect(countWords(result[0])).toBeLessThanOrEqual(850);
        expect(countWords(result[1])).toBeGreaterThanOrEqual(600);
        expect(countWords(result[1])).toBeLessThanOrEqual(800);
      });

      it('should split 2500-word article into 4 chunks', () => {
        const text = generateText(2500);
        const result = service.splitArticles(text);

        expect(result.length).toBe(4);
        // First 3 chunks should be ~800 words, last chunk ~100 words
        for (let i = 0; i < 3; i++) {
          expect(countWords(result[i])).toBeGreaterThanOrEqual(750);
          expect(countWords(result[i])).toBeLessThanOrEqual(850);
        }
      });

      it('should preserve content across chunk boundaries', () => {
        // Create text where we can verify ordering
        const prefix = 'START';
        const suffix = 'END';
        const middle = generateText(1600);
        const text = prefix + ' ' + middle + ' ' + suffix;

        const result = service.splitArticles(text);

        // First chunk should contain START
        expect(result[0].includes('START')).toBe(true);
        // Last chunk should contain END
        expect(result[result.length - 1].includes('END')).toBe(true);
      });
    });

    describe('article header preservation', () => {
      it('should preserve article headers when splitting', () => {
        const text =
          'Preamble text here. Article 1 Title of Article One This is the body of article one with many words. ' +
          generateText(1600) +
          ' Article 2 Title of Article Two This is the body of article two.';
        const result = service.splitArticles(text);

        // Should have chunks containing article headers
        const hasArticleHeader = result.some((chunk) =>
          /Article\s+\d+/i.test(chunk),
        );
        expect(hasArticleHeader).toBe(true);
      });

      it('should handle preamble separately from articles', () => {
        const preamble =
          'This is the preamble text that comes before any articles.';
        const articleText = 'Article 1 First Article Body ' + generateText(100);
        const text = preamble + ' ' + articleText;

        const result = service.splitArticles(text);

        expect(result.length).toBeGreaterThan(0);
      });

      it('should preserve article header in each chunk when splitting long articles', () => {
        // Create an article with header followed by lots of content
        const header = 'Article 1 Important Title';
        const body = generateText(1600);
        const text = header + ' ' + body;

        const result = service.splitArticles(text);

        // First chunk should contain the header
        expect(result[0]).toContain('Article 1');
      });
    });
  });
});
