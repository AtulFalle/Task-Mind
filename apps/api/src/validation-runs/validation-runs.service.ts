import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationRunItemStatus,
  ValidationRunStatus,
  type AddValidationRunItemRequest,
  type CreateValidationRunRequest,
  type ValidationRun,
  type ValidationRunItem,
} from '@task-mind/shared';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

interface ValidationRunItemRecord {
  id: string;
  validationRunId: string;
  documentId: string | null;
  aiSuggestionId: string | null;
  expectedLabel: string | null;
  predictedLabel: string | null;
  finalLabel: string | null;
  status: ValidationRunItem['status'];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ValidationRunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(
    workspaceId: string,
    request: CreateValidationRunRequest,
  ): Promise<ValidationRun> {
    await this.workspacesService.findOne(workspaceId);

    const run = await this.prisma.validationRun.create({
      data: {
        workspaceId,
        name: request.name.trim(),
        description: request.description?.trim() || null,
        mode: request.mode,
        status: ValidationRunStatus.RUNNING,
      },
    });

    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId,
        eventType: 'VALIDATION_RUN_CREATED',
        payloadJson: {
          validationRunId: run.id,
          name: run.name,
          mode: run.mode,
        },
      },
    });

    return this.toValidationRun(run);
  }

  async findByWorkspace(workspaceId: string): Promise<ValidationRun[]> {
    await this.workspacesService.findOne(workspaceId);

    const runs = await this.prisma.validationRun.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return runs.map((run) => this.toValidationRun(run));
  }

  async findOne(runId: string): Promise<ValidationRun> {
    const run = await this.prisma.validationRun.findUnique({
      where: { id: runId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!run) {
      throw new NotFoundException(`Validation run ${runId} was not found.`);
    }

    return this.toValidationRun(run);
  }

  async addItem(
    runId: string,
    request: AddValidationRunItemRequest,
  ): Promise<ValidationRunItem> {
    const run = await this.prisma.validationRun.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Validation run ${runId} was not found.`);
    }

    if (
      run.status === ValidationRunStatus.COMPLETED ||
      run.status === ValidationRunStatus.CANCELLED
    ) {
      throw new BadRequestException('Completed validation runs cannot be changed.');
    }

    const item = await this.prisma.$transaction(async (tx) => {
      const createdItem = await tx.validationRunItem.create({
        data: {
          validationRunId: run.id,
          documentId: request.documentId || null,
          aiSuggestionId: request.aiSuggestionId || null,
          expectedLabel: request.expectedLabel?.trim() || null,
          predictedLabel: request.predictedLabel?.trim() || null,
          finalLabel: request.finalLabel?.trim() || null,
          status: request.status,
        },
      });

      if (run.status === ValidationRunStatus.DRAFT) {
        await tx.validationRun.update({
          where: { id: run.id },
          data: { status: ValidationRunStatus.RUNNING },
        });
      }

      return createdItem;
    });

    return this.toValidationRunItem(item);
  }

  async complete(runId: string): Promise<ValidationRun> {
    const run = await this.prisma.validationRun.findUnique({
      where: { id: runId },
      include: { items: true },
    });

    if (!run) {
      throw new NotFoundException(`Validation run ${runId} was not found.`);
    }

    if (run.status === ValidationRunStatus.CANCELLED) {
      throw new BadRequestException('Cancelled validation runs cannot be completed.');
    }

    const totalItems = run.items.length;
    const approvedCount = run.items.filter(
      (item) => item.status === ValidationRunItemStatus.APPROVED,
    ).length;
    const rejectedCount = run.items.filter(
      (item) => item.status === ValidationRunItemStatus.REJECTED,
    ).length;
    const editedCount = run.items.filter(
      (item) => item.status === ValidationRunItemStatus.EDITED,
    ).length;
    const correctionCount = rejectedCount + editedCount;
    const approvalRate = this.toRate(approvedCount, totalItems);
    const correctionRate = this.toRate(correctionCount, totalItems);

    const completedRun = await this.prisma.validationRun.update({
      where: { id: run.id },
      data: {
        status: ValidationRunStatus.COMPLETED,
        totalItems,
        approvedCount,
        rejectedCount,
        editedCount,
        correctionRate,
        approvalRate,
        completedAt: new Date(),
      },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId: completedRun.workspaceId,
        eventType: 'VALIDATION_RUN_COMPLETED',
        payloadJson: {
          validationRunId: completedRun.id,
          totalItems,
          approvedCount,
          rejectedCount,
          editedCount,
          correctionRate,
          approvalRate,
        },
      },
    });

    return this.toValidationRun(completedRun);
  }

  async delete(runId: string): Promise<void> {
    const run = await this.prisma.validationRun.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Validation run ${runId} was not found.`);
    }

    await this.prisma.validationRun.delete({ where: { id: runId } });
  }

  private toValidationRun(
    run: {
      id: string;
      workspaceId: string;
      name: string;
      description: string | null;
      mode: ValidationRun['mode'];
      status: ValidationRun['status'];
      totalItems: number;
      approvedCount: number;
      rejectedCount: number;
      editedCount: number;
      correctionRate: number;
      approvalRate: number;
      startedAt: Date;
      completedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      items?: ValidationRunItemRecord[];
    },
  ): ValidationRun {
    return {
      id: run.id,
      workspaceId: run.workspaceId,
      name: run.name,
      description: run.description ?? undefined,
      mode: run.mode,
      status: run.status,
      totalItems: run.totalItems,
      approvedCount: run.approvedCount,
      rejectedCount: run.rejectedCount,
      editedCount: run.editedCount,
      correctionRate: run.correctionRate,
      approvalRate: run.approvalRate,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
      items: run.items?.map((item) => this.toValidationRunItem(item)),
    };
  }

  private toValidationRunItem(item: ValidationRunItemRecord): ValidationRunItem {
    return {
      id: item.id,
      validationRunId: item.validationRunId,
      documentId: item.documentId ?? undefined,
      aiSuggestionId: item.aiSuggestionId ?? undefined,
      expectedLabel: item.expectedLabel ?? undefined,
      predictedLabel: item.predictedLabel ?? undefined,
      finalLabel: item.finalLabel ?? undefined,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private toRate(count: number, total: number): number {
    return total > 0 ? count / total : 0;
  }
}
