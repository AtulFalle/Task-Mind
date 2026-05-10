import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RuleCategory, RuleSource } from '@task-mind/shared';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';

describe('RulesController', () => {
  let app: INestApplication;

  const rulesService = {
    create: jest.fn(),
    findByWorkspace: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
        {
          provide: RulesService,
          useValue: rulesService,
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

  it('routes POST /api/workspaces/:workspaceId/rules to rule creation', async () => {
    rulesService.create.mockReturnValue({
      id: 'rule-1',
      workspaceId: 'workspace-1',
      title: 'Experience section structure',
      ruleText:
        'Experience section usually contains role title, company name, duration, and short description.',
      category: RuleCategory.EXTRACTION,
      source: RuleSource.HUMAN,
      confidence: 1,
      createdAt: '2026-05-10T11:15:20.085Z',
      updatedAt: '2026-05-10T11:15:20.085Z',
    });

    const response = await fetch(
      `${thisServerUrl(app)}/api/workspaces/workspace-1/rules`,
      {
        body: JSON.stringify({
          title: 'Experience section structure',
          ruleText:
            'Experience section usually contains role title, company name, duration, and short description.',
          category: RuleCategory.EXTRACTION,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      id: 'rule-1',
      workspaceId: 'workspace-1',
      source: RuleSource.HUMAN,
      confidence: 1,
    });
    expect(rulesService.create).toHaveBeenCalledWith('workspace-1', {
      title: 'Experience section structure',
      ruleText:
        'Experience section usually contains role title, company name, duration, and short description.',
      category: RuleCategory.EXTRACTION,
    });
  });

  it('routes GET /api/workspaces/:workspaceId/rules to workspace rule listing', async () => {
    rulesService.findByWorkspace.mockReturnValue([]);

    const response = await fetch(
      `${thisServerUrl(app)}/api/workspaces/workspace-1/rules`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(rulesService.findByWorkspace).toHaveBeenCalledWith('workspace-1');
  });

  it('routes DELETE /api/rules/:ruleId to rule removal', async () => {
    const response = await fetch(`${thisServerUrl(app)}/api/rules/rule-1`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(204);
    expect(rulesService.remove).toHaveBeenCalledWith('rule-1');
  });
});

function thisServerUrl(app: INestApplication): string {
  const serverAddress = app.getHttpServer().address();
  const port =
    typeof serverAddress === 'string' ? serverAddress : serverAddress.port;

  return `http://127.0.0.1:${port}`;
}
