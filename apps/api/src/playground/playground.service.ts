import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  PlaygroundExampleStatus,
  PlaygroundIntent,
  PlaygroundPriority,
  type AiContextStats,
  type PlaygroundClassificationRequest,
  type PlaygroundClassificationResponse,
  type PlaygroundCorrectionRequest,
  type PlaygroundExample,
  type PlaygroundMetrics,
} from '@task-mind/shared';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

type PlaygroundAiResponse = {
  intent?: unknown;
  priority?: unknown;
  reasoning?: unknown;
  confidence?: unknown;
};

type PlaygroundExampleRecord = {
  id: string;
  workspaceId: string;
  inputText: string;
  predictedIntent: PlaygroundIntent;
  predictedPriority: PlaygroundPriority;
  predictedReasoning: string;
  predictedConfidence: number;
  finalIntent: PlaygroundIntent | null;
  finalPriority: PlaygroundPriority | null;
  correctionReason: string | null;
  status: PlaygroundExampleStatus;
  createdAt: Date;
  updatedAt: Date;
};

type OperationalRuleRecord = {
  id: string;
  title: string;
  ruleText: string;
  category: string;
  source: string;
  confidence: number;
};

const ALLOWED_INTENTS = Object.values(PlaygroundIntent);
const ALLOWED_PRIORITIES = Object.values(PlaygroundPriority);
const MAX_INPUT_TEXT_CHARS = 8000;

@Injectable()
export class PlaygroundService {
  private readonly aiServiceUrl =
    process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';
  private readonly timeoutMs = Number(
    process.env.AI_SERVICE_TIMEOUT_MS ?? 160000,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async classify(
    workspaceId: string,
    request: PlaygroundClassificationRequest,
  ): Promise<PlaygroundClassificationResponse> {
    const workspace = await this.workspacesService.findOne(workspaceId);
    const inputText = request.inputText.trim();

    if (!inputText) {
      throw new BadRequestException('Message text is required.');
    }

    const { context, contextStats } = await this.buildContext(workspace.id);
    const prediction = this.toPrediction(
      await this.callAiService({
        inputText: inputText.slice(0, MAX_INPUT_TEXT_CHARS),
        context,
      }),
    );

    const example = await this.prisma.playgroundExample.create({
      data: {
        workspaceId: workspace.id,
        inputText,
        predictedIntent: prediction.intent,
        predictedPriority: prediction.priority,
        predictedReasoning: prediction.reasoning,
        predictedConfidence: prediction.confidence,
        status: PlaygroundExampleStatus.PENDING,
      },
    });

    await this.createFeedbackEvent(
      workspace.id,
      PlaygroundExampleStatus.PENDING,
      'PLAYGROUND_EXAMPLE_CREATED',
      example,
      { contextStats },
    );

    return {
      exampleId: example.id,
      intent: prediction.intent,
      priority: prediction.priority,
      reasoning: prediction.reasoning,
      confidence: prediction.confidence,
      contextStats,
    };
  }

  async approve(exampleId: string): Promise<PlaygroundExample> {
    const example = await this.findRecord(exampleId);
    const updatedExample = await this.prisma.playgroundExample.update({
      where: { id: example.id },
      data: {
        finalIntent: example.predictedIntent,
        finalPriority: example.predictedPriority,
        status: PlaygroundExampleStatus.APPROVED,
      },
    });

    await this.createFeedbackEvent(
      updatedExample.workspaceId,
      PlaygroundExampleStatus.APPROVED,
      'PLAYGROUND_EXAMPLE_APPROVED',
      updatedExample,
    );

    return this.toPlaygroundExample(updatedExample);
  }

  async correct(
    exampleId: string,
    request: PlaygroundCorrectionRequest,
  ): Promise<PlaygroundExample> {
    const example = await this.findRecord(exampleId);
    const correctionReason = request.correctionReason.trim();

    if (!correctionReason) {
      throw new BadRequestException('Correction reason is required.');
    }

    const updatedExample = await this.prisma.playgroundExample.update({
      where: { id: example.id },
      data: {
        finalIntent: request.finalIntent,
        finalPriority: request.finalPriority,
        correctionReason,
        status: PlaygroundExampleStatus.CORRECTED,
      },
    });

    await this.createFeedbackEvent(
      updatedExample.workspaceId,
      PlaygroundExampleStatus.CORRECTED,
      'PLAYGROUND_EXAMPLE_CORRECTED',
      updatedExample,
    );

    return this.toPlaygroundExample(updatedExample);
  }

  async reject(exampleId: string): Promise<PlaygroundExample> {
    const example = await this.findRecord(exampleId);
    const updatedExample = await this.prisma.playgroundExample.update({
      where: { id: example.id },
      data: { status: PlaygroundExampleStatus.REJECTED },
    });

    await this.createFeedbackEvent(
      updatedExample.workspaceId,
      PlaygroundExampleStatus.REJECTED,
      'PLAYGROUND_EXAMPLE_REJECTED',
      updatedExample,
    );

    return this.toPlaygroundExample(updatedExample);
  }

  async findByWorkspace(workspaceId: string): Promise<PlaygroundExample[]> {
    await this.workspacesService.findOne(workspaceId);

    const examples = await this.prisma.playgroundExample.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return examples.map((example) => this.toPlaygroundExample(example));
  }

  async getMetrics(workspaceId: string): Promise<PlaygroundMetrics> {
    await this.workspacesService.findOne(workspaceId);

    const [totalPredictions, approved, corrected] = await Promise.all([
      this.prisma.playgroundExample.count({ where: { workspaceId } }),
      this.prisma.playgroundExample.count({
        where: { workspaceId, status: PlaygroundExampleStatus.APPROVED },
      }),
      this.prisma.playgroundExample.count({
        where: { workspaceId, status: PlaygroundExampleStatus.CORRECTED },
      }),
    ]);
    const reviewed = approved + corrected;

    return {
      workspaceId,
      totalPredictions,
      approved,
      corrected,
      correctionRate: reviewed ? corrected / reviewed : 0,
    };
  }

  private async buildContext(workspaceId: string) {
    const [rules, approvedExamples, correctedExamples, rejectedExamples] =
      await Promise.all([
        this.prisma.operationalRule.findMany({
          where: { workspaceId },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        this.prisma.playgroundExample.findMany({
          where: { workspaceId, status: PlaygroundExampleStatus.APPROVED },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        this.prisma.playgroundExample.findMany({
          where: { workspaceId, status: PlaygroundExampleStatus.CORRECTED },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        this.prisma.playgroundExample.findMany({
          where: { workspaceId, status: PlaygroundExampleStatus.REJECTED },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ]);

    const context = {
      rules: rules.map((rule) => this.toRuleContext(rule)),
      approvedExamples: approvedExamples.map((example) =>
        this.toExampleContext(example),
      ),
      correctedExamples: correctedExamples.map((example) =>
        this.toExampleContext(example),
      ),
      rejectedExamples: rejectedExamples.map((example) =>
        this.toExampleContext(example),
      ),
      allowedIntents: ALLOWED_INTENTS,
      allowedPriorities: ALLOWED_PRIORITIES,
    };
    const contextStats: AiContextStats = {
      rulesUsed: context.rules.length,
      approvedExamplesUsed: context.approvedExamples.length,
      correctedExamplesUsed: context.correctedExamples.length,
      rejectedExamplesUsed: context.rejectedExamples.length,
    };

    return { context, contextStats };
  }

  private async callAiService(payload: unknown): Promise<PlaygroundAiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `${this.aiServiceUrl}/classify-message-intent`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new ServiceUnavailableException(
          `AI service returned ${response.status}.`,
        );
      }

      return (await response.json()) as PlaygroundAiResponse;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'AI service is unavailable or timed out.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async findRecord(exampleId: string): Promise<PlaygroundExampleRecord> {
    const example = await this.prisma.playgroundExample.findUnique({
      where: { id: exampleId },
    });

    if (!example) {
      throw new NotFoundException(
        `Playground example ${exampleId} was not found.`,
      );
    }

    return example;
  }

  private async createFeedbackEvent(
    workspaceId: string,
    status: PlaygroundExampleStatus,
    eventType:
      | 'PLAYGROUND_EXAMPLE_CREATED'
      | 'PLAYGROUND_EXAMPLE_APPROVED'
      | 'PLAYGROUND_EXAMPLE_CORRECTED'
      | 'PLAYGROUND_EXAMPLE_REJECTED',
    example: PlaygroundExampleRecord,
    extraPayload: Record<string, unknown> = {},
  ): Promise<void> {
    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId,
        eventType,
        payloadJson: {
          playgroundExampleId: example.id,
          inputPreview: example.inputText.slice(0, 160),
          predictedIntent: example.predictedIntent,
          predictedPriority: example.predictedPriority,
          finalIntent: example.finalIntent,
          finalPriority: example.finalPriority,
          correctionReason: example.correctionReason,
          status,
          ...extraPayload,
        },
      },
    });
  }

  private toPrediction(response: PlaygroundAiResponse) {
    const intent = ALLOWED_INTENTS.includes(response.intent as PlaygroundIntent)
      ? (response.intent as PlaygroundIntent)
      : PlaygroundIntent.UNKNOWN;
    const priority = ALLOWED_PRIORITIES.includes(
      response.priority as PlaygroundPriority,
    )
      ? (response.priority as PlaygroundPriority)
      : PlaygroundPriority.LOW;
    const reasoning =
      typeof response.reasoning === 'string' && response.reasoning.trim()
        ? response.reasoning.trim()
        : 'The model did not return a valid reason.';
    const confidence = Number(response.confidence);

    return {
      intent,
      priority,
      reasoning,
      confidence: Number.isNaN(confidence)
        ? 0
        : Math.min(1, Math.max(0, confidence)),
    };
  }

  private toRuleContext(rule: OperationalRuleRecord) {
    return {
      id: rule.id,
      title: rule.title,
      ruleText: rule.ruleText,
      category: rule.category,
      source: rule.source,
      confidence: rule.confidence,
    };
  }

  private toExampleContext(example: PlaygroundExampleRecord) {
    return {
      id: example.id,
      inputText: example.inputText.slice(0, 1000),
      predictedIntent: example.predictedIntent,
      predictedPriority: example.predictedPriority,
      predictedReasoning: example.predictedReasoning,
      predictedConfidence: example.predictedConfidence,
      finalIntent: example.finalIntent,
      finalPriority: example.finalPriority,
      correctionReason: example.correctionReason,
      status: example.status,
      createdAt: example.createdAt.toISOString(),
    };
  }

  private toPlaygroundExample(
    example: PlaygroundExampleRecord,
  ): PlaygroundExample {
    return {
      id: example.id,
      workspaceId: example.workspaceId,
      inputText: example.inputText,
      predictedIntent: example.predictedIntent,
      predictedPriority: example.predictedPriority,
      predictedReasoning: example.predictedReasoning,
      predictedConfidence: example.predictedConfidence,
      finalIntent: example.finalIntent ?? undefined,
      finalPriority: example.finalPriority ?? undefined,
      correctionReason: example.correctionReason ?? undefined,
      status: example.status,
      createdAt: example.createdAt.toISOString(),
      updatedAt: example.updatedAt.toISOString(),
    };
  }
}
