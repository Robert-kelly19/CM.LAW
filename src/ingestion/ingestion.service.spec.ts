import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { LawService } from '../law/law.service';
import { PdfParserService } from './pdf-parser/pdf-parser.service';
import { ChunkerService } from './chunker/chunker.service';

describe('IngestionService', () => {
  let service: IngestionService;
  let mockLawService: {
    createLaw: jest.Mock;
    getAllLaws: jest.Mock;
    searchByContent: jest.Mock;
  };
  let mockPdfParserService: {
    parsePdf: jest.Mock;
  };
  let mockChunkerService: {
    splitArticles: jest.Mock;
  };

  beforeEach(async () => {
    // Create mock services
    mockLawService = {
      createLaw: jest.fn(),
      getAllLaws: jest.fn(),
      searchByContent: jest.fn(),
    };

    mockPdfParserService = {
      parsePdf: jest.fn(),
    };

    mockChunkerService = {
      splitArticles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: LawService,
          useValue: mockLawService,
        },
        {
          provide: PdfParserService,
          useValue: mockPdfParserService,
        },
        {
          provide: ChunkerService,
          useValue: mockChunkerService,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should ingest PDF and store law sections', async () => {
    // Setup mock returns
    const mockText = 'Article 1 Test content';
    const mockChunks = ['Article 1 Test content'];

    mockPdfParserService.parsePdf.mockResolvedValue(mockText);
    mockChunkerService.splitArticles.mockReturnValue(mockChunks);
    mockLawService.createLaw.mockResolvedValue({
      id: '1',
      lawName: 'The Constitution',
      content: 'Article 1 Test content',
      source: 'The_constitution.pdf',
      articleNumber: 'Article 1',
    });

    const result = await service.store('pdfs/test.pdf');

    expect(mockPdfParserService.parsePdf).toHaveBeenCalledWith('pdfs/test.pdf');
    expect(mockChunkerService.splitArticles).toHaveBeenCalledWith(mockText);
    expect(mockLawService.createLaw).toHaveBeenCalled();
    expect(result.totalArticles).toBe(1);
  });

  it('should handle multiple chunks', async () => {
    const mockText =
      'Article 1 Content ' + 'word '.repeat(800) + 'Article 2 Content';
    const mockChunks = [
      'Article 1 Content ' + 'word '.repeat(799),
      'word Article 2 Content',
    ];

    mockPdfParserService.parsePdf.mockResolvedValue(mockText);
    mockChunkerService.splitArticles.mockReturnValue(mockChunks);
    mockLawService.createLaw.mockResolvedValue({} as never);

    const result = await service.store();

    expect(result.totalArticles).toBe(2);
    expect(mockLawService.createLaw).toHaveBeenCalledTimes(2);
  });
});
