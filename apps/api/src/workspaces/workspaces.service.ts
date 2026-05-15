import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AiContextStats,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceValidationMetrics,
  WorkspaceValidationReadiness,
} from '@task-mind/shared';
import { AiSuggestionStatus } from '@task-mind/shared';
import { DocumentType, SuggestionMode } from '@task-mind/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  private readonly aiServiceUrl =
    process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkspace: CreateWorkspaceRequest): Promise<Workspace> {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspace.name.trim(),
        description: createWorkspace.description?.trim() || null,
        studioType: createWorkspace.studioType,
      },
    });

    return this.toWorkspace(workspace);
  }

  async findAll(): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return workspaces.map((workspace) => this.toWorkspace(workspace));
  }

  async findOne(id: string): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} was not found.`);
    }

    return this.toWorkspace(workspace);
  }

  async update(
    id: string,
    updateWorkspace: UpdateWorkspaceRequest,
  ): Promise<Workspace> {
    await this.findOne(id);

    const workspace = await this.prisma.workspace.update({
      where: { id },
      data: {
        name: updateWorkspace.name.trim(),
        description: updateWorkspace.description?.trim() || null,
        studioType: updateWorkspace.studioType,
      },
    });

    return this.toWorkspace(workspace);
  }

  async getValidationMetrics(
    workspaceId: string,
  ): Promise<WorkspaceValidationMetrics> {
    await this.findOne(workspaceId);

    const [
      totalSuggestions,
      approvedSuggestions,
      rejectedSuggestions,
      editedSuggestions,
      convertedToAnnotations,
      unknownPredictions,
      unknownCorrections,
      forcedClassificationErrors,
      totalAnnotations,
      totalRules,
      totalTrainingCandidates,
    ] = await Promise.all([
      this.prisma.aiSuggestion.count({ where: { workspaceId } }),
      this.prisma.aiSuggestion.count({
        where: { workspaceId, status: AiSuggestionStatus.APPROVED },
      }),
      this.prisma.aiSuggestion.count({
        where: { workspaceId, status: AiSuggestionStatus.REJECTED },
      }),
      this.prisma.aiSuggestion.count({
        where: { workspaceId, status: AiSuggestionStatus.EDITED },
      }),
      this.prisma.aiSuggestion.count({
        where: {
          workspaceId,
          status: AiSuggestionStatus.CONVERTED_TO_ANNOTATION,
        },
      }),
      this.prisma.aiSuggestion.count({
        where: {
          workspaceId,
          mode: SuggestionMode.DOCUMENT_CLASSIFICATION,
          selectedText: DocumentType.UNKNOWN,
        },
      }),
      this.prisma.aiSuggestion.count({
        where: {
          workspaceId,
          mode: SuggestionMode.DOCUMENT_CLASSIFICATION,
          status: AiSuggestionStatus.EDITED,
          correctedSelectedText: DocumentType.UNKNOWN,
        },
      }),
      this.prisma.aiSuggestion.count({
        where: {
          workspaceId,
          mode: SuggestionMode.DOCUMENT_CLASSIFICATION,
          status: AiSuggestionStatus.EDITED,
          selectedText: { not: DocumentType.UNKNOWN },
          correctedSelectedText: DocumentType.UNKNOWN,
        },
      }),
      this.prisma.annotation.count({ where: { workspaceId } }),
      this.prisma.operationalRule.count({ where: { workspaceId } }),
      this.prisma.trainingCandidate.count({ where: { workspaceId } }),
    ]);

    return {
      workspaceId,
      totalSuggestions,
      approvedSuggestions,
      rejectedSuggestions,
      editedSuggestions,
      convertedToAnnotations,
      unknownPredictions,
      unknownCorrections,
      forcedClassificationErrors,
      approvalRate: this.toRate(approvedSuggestions, totalSuggestions),
      correctionRate: this.toRate(
        editedSuggestions + rejectedSuggestions,
        totalSuggestions,
      ),
      rejectionRate: this.toRate(rejectedSuggestions, totalSuggestions),
      applicabilityRejectionRate: this.toRate(
        unknownPredictions,
        totalSuggestions,
      ),
      totalAnnotations,
      totalRules,
      totalTrainingCandidates,
    };
  }

  async getValidationReadiness(
    workspaceId: string,
  ): Promise<WorkspaceValidationReadiness> {
    await this.findOne(workspaceId);

    const [
      documentCount,
      ruleCount,
      aiSuggestionCount,
      humanFeedbackCount,
      latestClassificationSuggestion,
      aiServiceReachable,
    ] = await Promise.all([
      this.prisma.document.count({ where: { workspaceId } }),
      this.prisma.operationalRule.count({ where: { workspaceId } }),
      this.prisma.aiSuggestion.count({ where: { workspaceId } }),
      this.prisma.feedbackEvent.count({
        where: {
          workspaceId,
          eventType: {
            in: [
              'AI_SUGGESTION_APPROVED',
              'AI_SUGGESTION_REJECTED',
              'AI_SUGGESTION_EDITED',
              'AI_SUGGESTION_CONVERTED_TO_ANNOTATION',
            ],
          },
        },
      }),
      this.prisma.aiSuggestion.findFirst({
        where: {
          workspaceId,
          mode: SuggestionMode.DOCUMENT_CLASSIFICATION,
        },
        orderBy: { createdAt: 'desc' },
        select: { payloadJson: true },
      }),
      this.checkAiServiceHealth(),
    ]);

    return {
      hasDocuments: documentCount > 0,
      hasRules: ruleCount > 0,
      hasAiSuggestions: aiSuggestionCount > 0,
      hasHumanFeedback: humanFeedbackCount > 0,
      aiServiceReachable,
      latestContextStats: this.toContextStats(
        latestClassificationSuggestion?.payloadJson,
      ),
    };
  }

  private toWorkspace(workspace: {
    id: string;
    name: string;
    description: string | null;
    studioType: Workspace['studioType'];
    createdAt: Date;
    updatedAt: Date;
  }): Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || undefined,
      studioType: workspace.studioType,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  private toRate(count: number, total: number): number {
    return total > 0 ? count / total : 0;
  }

  private async checkAiServiceHealth(): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(`${this.aiServiceUrl}/health`, {
        signal: controller.signal,
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  private toContextStats(payloadJson: unknown): AiContextStats {
    const payload =
      payloadJson && typeof payloadJson === 'object'
        ? (payloadJson as Record<string, unknown>)
        : {};
    const contextStats =
      payload['contextStats'] && typeof payload['contextStats'] === 'object'
        ? (payload['contextStats'] as Record<string, unknown>)
        : {};

    return {
      rulesUsed: this.toNonNegativeCount(contextStats['rulesUsed']),
      approvedExamplesUsed: this.toNonNegativeCount(
        contextStats['approvedExamplesUsed'],
      ),
      correctedExamplesUsed: this.toNonNegativeCount(
        contextStats['correctedExamplesUsed'],
      ),
      rejectedExamplesUsed: this.toNonNegativeCount(
        contextStats['rejectedExamplesUsed'],
      ),
    };
  }

  private toNonNegativeCount(value: unknown): number {
    const count = Number(value);

    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  }
}
