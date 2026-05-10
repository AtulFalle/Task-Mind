import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FeedbackEventType } from '@task-mind/shared';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

describe('FeedbackController', () => {
  let app: INestApplication;

  const feedbackService = {
    findByDocument: jest.fn(),
    findByWorkspace: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: feedbackService,
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

  it('routes GET /api/workspaces/:workspaceId/feedback-events to workspace feedback listing', async () => {
    feedbackService.findByWorkspace.mockReturnValue([
      {
        id: 'event-1',
        workspaceId: 'workspace-1',
        eventType: FeedbackEventType.RULE_CREATED,
        payloadJson: {
          ruleId: 'rule-1',
          title: 'Experience section structure',
        },
        createdAt: '2026-05-10T11:15:20.085Z',
      },
    ]);

    const response = await fetch(
      `${thisServerUrl(app)}/api/workspaces/workspace-1/feedback-events`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([
      {
        id: 'event-1',
        workspaceId: 'workspace-1',
        eventType: FeedbackEventType.RULE_CREATED,
      },
    ]);
    expect(feedbackService.findByWorkspace).toHaveBeenCalledWith('workspace-1');
  });

  it('routes GET /api/documents/:documentId/feedback-events to document feedback listing', async () => {
    feedbackService.findByDocument.mockReturnValue([]);

    const response = await fetch(
      `${thisServerUrl(app)}/api/documents/document-1/feedback-events`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(feedbackService.findByDocument).toHaveBeenCalledWith('document-1');
  });
});

function thisServerUrl(app: INestApplication): string {
  const serverAddress = app.getHttpServer().address();
  const port =
    typeof serverAddress === 'string' ? serverAddress : serverAddress.port;

  return `http://127.0.0.1:${port}`;
}
