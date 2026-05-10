import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ExtractedTextStatus } from '@task-mind/shared';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

describe('DocumentsController', () => {
  let app: INestApplication;

  const documentsService = {
    findByWorkspace: jest.fn(),
    findOne: jest.fn(),
    getText: jest.fn(),
    upload: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: documentsService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes GET /api/documents/:documentId/text to extracted text retrieval', async () => {
    documentsService.getText.mockReturnValue({
      documentId: 'document-1',
      status: ExtractedTextStatus.COMPLETED,
      text: 'Parsed text',
    });

    const serverAddress = app.getHttpServer().address();
    const port =
      typeof serverAddress === 'string' ? serverAddress : serverAddress.port;
    const response = await fetch(
      `http://127.0.0.1:${port}/api/documents/document-1/text`,
    );

    await expect(response.json()).resolves.toEqual({
      documentId: 'document-1',
      status: ExtractedTextStatus.COMPLETED,
      text: 'Parsed text',
    });
    expect(response.status).toBe(200);
    expect(documentsService.getText).toHaveBeenCalledWith('document-1');
    expect(documentsService.findOne).not.toHaveBeenCalled();
  });
});
