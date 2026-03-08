import { Test, TestingModule } from '@nestjs/testing';
import { LawService } from './law.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LawService', () => {
  let service: LawService;
  let mockPrismaService: {
    lawSection: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Create mock PrismaService
    mockPrismaService = {
      lawSection: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LawService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LawService>(LawService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a law section', async () => {
    const mockLaw = {
      id: 1,
      lawName: 'Test Law',
      content: 'Test content',
      source: 'test.pdf',
      articleNumber: 'Article 1',
      embedding: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaService.lawSection.create.mockResolvedValue(mockLaw);

    const result = await service.createLaw(
      'Test Law',
      'Test content',
      'test.pdf',
      'Article 1',
    );

    expect(result).toEqual(mockLaw);
    expect(mockPrismaService.lawSection.create).toHaveBeenCalledWith({
      data: {
        lawName: 'Test Law',
        content: 'Test content',
        source: 'test.pdf',
        articleNumber: 'Article 1',
      },
    });
  });

  it('should return all law sections', async () => {
    const mockLaws = [
      {
        id: 1,
        lawName: 'Test Law 1',
        content: 'Content 1',
        source: 'test1.pdf',
        articleNumber: 'Article 1',
        embedding: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        lawName: 'Test Law 2',
        content: 'Content 2',
        source: 'test2.pdf',
        articleNumber: 'Article 2',
        embedding: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrismaService.lawSection.findMany.mockResolvedValue(mockLaws);

    const result = await service.getAllLaws();

    expect(result).toEqual(mockLaws);
    expect(mockPrismaService.lawSection.findMany).toHaveBeenCalled();
  });
});
