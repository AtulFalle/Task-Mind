import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from './annotations.service';

describe('AnnotationsController', () => {
  let app: INestApplication;

  const annotationsService = {
    create: jest.fn(),
    findByDocument: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AnnotationsController],
      providers: [
        {
          provide: AnnotationsService,
          useValue: annotationsService,
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

  it('routes POST /api/documents/:documentId/annotations to annotation creation', async () => {
    annotationsService.create.mockReturnValue({
      id: 'annotation-1',
      documentId: 'document-1',
      workspaceId: 'workspace-1',
      fieldName: 'invoiceNumber',
      selectedText: 'INV-1001',
      explanation: 'This identifies the invoice.',
      createdAt: '2026-05-10T10:15:20.085Z',
      updatedAt: '2026-05-10T10:15:20.085Z',
    });

    const response = await fetch(
      `${thisServerUrl(app)}/api/documents/document-1/annotations`,
      {
        body: JSON.stringify({
          fieldName: 'invoiceNumber',
          selectedText: 'INV-1001',
          explanation: 'This identifies the invoice.',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      id: 'annotation-1',
      documentId: 'document-1',
      fieldName: 'invoiceNumber',
      selectedText: 'INV-1001',
    });
    expect(annotationsService.create).toHaveBeenCalledWith('document-1', {
      fieldName: 'invoiceNumber',
      selectedText: 'INV-1001',
      explanation: 'This identifies the invoice.',
    });
  });

  it('routes GET /api/documents/:documentId/annotations to document annotation listing', async () => {
    annotationsService.findByDocument.mockReturnValue([]);

    const response = await fetch(
      `${thisServerUrl(app)}/api/documents/document-1/annotations`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(annotationsService.findByDocument).toHaveBeenCalledWith('document-1');
  });

  it('routes DELETE /api/annotations/:annotationId to annotation removal', async () => {
    const response = await fetch(
      `${thisServerUrl(app)}/api/annotations/annotation-1`,
      { method: 'DELETE' },
    );

    expect(response.status).toBe(204);
    expect(annotationsService.remove).toHaveBeenCalledWith('annotation-1');
  });

  it('routes PATCH /api/annotations/:annotationId to annotation update', async () => {
    annotationsService.update.mockReturnValue({
      id: 'annotation-1',
      documentId: 'document-1',
      workspaceId: 'workspace-1',
      fieldName: 'totalAmount',
      selectedText: '$245.00',
      createdAt: '2026-05-10T10:15:20.085Z',
      updatedAt: '2026-05-10T10:20:20.085Z',
    });

    const response = await fetch(
      `${thisServerUrl(app)}/api/annotations/annotation-1`,
      {
        body: JSON.stringify({
          fieldName: 'totalAmount',
          explanation: 'This is the invoice total.',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'PATCH',
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: 'annotation-1',
      fieldName: 'totalAmount',
      selectedText: '$245.00',
    });
    expect(annotationsService.update).toHaveBeenCalledWith('annotation-1', {
      fieldName: 'totalAmount',
      explanation: 'This is the invoice total.',
    });
  });
});

function thisServerUrl(app: INestApplication): string {
  const serverAddress = app.getHttpServer().address();
  const port =
    typeof serverAddress === 'string' ? serverAddress : serverAddress.port;

  return `http://127.0.0.1:${port}`;
}
