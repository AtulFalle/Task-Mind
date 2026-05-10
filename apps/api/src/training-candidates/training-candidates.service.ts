import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  TrainingCandidateStatus,
  TrainingCandidateType,
  type CreateTrainingCandidateRequest,
  type TrainingCandidate,
  type UpdateTrainingCandidateRequest,
} from '@task-mind/shared';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class TrainingCandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(
    workspaceId: string,
    createCandidate: CreateTrainingCandidateRequest,
  ): Promise<TrainingCandidate> {
    await this.workspacesService.findOne(workspaceId);
    await this.validateSourceOwnership(workspaceId, {
      documentId: createCandidate.documentId,
      annotationId: createCandidate.annotationId,
    });

    const inputText = createCandidate.inputText.trim();
    const instruction = createCandidate.instruction.trim();
    const reasoning = createCandidate.reasoning?.trim() || undefined;

    if (!inputText) {
      throw new BadRequestException('Input text is required.');
    }

    if (!instruction) {
      throw new BadRequestException('Instruction is required.');
    }

    if (!createCandidate.expectedOutput) {
      throw new BadRequestException('Expected output is required.');
    }

    const candidate = await this.prisma.trainingCandidate.create({
      data: {
        workspaceId,
        documentId: createCandidate.documentId,
        annotationId: createCandidate.annotationId,
        candidateType: createCandidate.candidateType,
        inputText,
        expectedOutput: createCandidate.expectedOutput as Prisma.InputJsonValue,
        instruction,
        reasoning,
        status: createCandidate.status ?? TrainingCandidateStatus.DRAFT,
      },
    });

    await this.createFeedbackEvent(candidate, 'TRAINING_CANDIDATE_CREATED');

    return this.toTrainingCandidate(candidate);
  }

  async createDraftFromAnnotation(
    annotationId: string,
  ): Promise<TrainingCandidate> {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id: annotationId },
      include: { document: true },
    });

    if (!annotation) {
      throw new NotFoundException(`Annotation ${annotationId} was not found.`);
    }

    const inputText =
      annotation.document.extractedText ||
      [
        annotation.contextBefore,
        annotation.selectedText,
        annotation.contextAfter,
      ]
        .filter((text): text is string => Boolean(text))
        .join('\n');

    const candidate = await this.prisma.trainingCandidate.create({
      data: {
        workspaceId: annotation.workspaceId,
        documentId: annotation.documentId,
        annotationId: annotation.id,
        candidateType: TrainingCandidateType.EXTRACTION,
        inputText,
        expectedOutput: {
          fieldName: annotation.fieldName,
          value: annotation.selectedText,
        },
        instruction: `Extract the ${annotation.fieldName} field from the document text.`,
        reasoning: annotation.explanation,
        status: TrainingCandidateStatus.DRAFT,
      },
    });

    await this.createFeedbackEvent(candidate, 'TRAINING_CANDIDATE_CREATED');

    return this.toTrainingCandidate(candidate);
  }

  async findByWorkspace(workspaceId: string): Promise<TrainingCandidate[]> {
    await this.workspacesService.findOne(workspaceId);

    const candidates = await this.prisma.trainingCandidate.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return candidates.map((candidate) => this.toTrainingCandidate(candidate));
  }

  async findOne(candidateId: string): Promise<TrainingCandidate> {
    const candidate = await this.prisma.trainingCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(
        `Training candidate ${candidateId} was not found.`,
      );
    }

    return this.toTrainingCandidate(candidate);
  }

  async update(
    candidateId: string,
    updateCandidate: UpdateTrainingCandidateRequest,
  ): Promise<TrainingCandidate> {
    const existingCandidate = await this.findCandidateRecord(candidateId);
    const data: {
      candidateType?: TrainingCandidateType;
      inputText?: string;
      expectedOutput?: Prisma.InputJsonValue;
      instruction?: string;
      reasoning?: string | null;
      status?: TrainingCandidateStatus;
    } = {};

    if (updateCandidate.candidateType !== undefined) {
      data.candidateType = updateCandidate.candidateType;
    }

    if (updateCandidate.inputText !== undefined) {
      const inputText = updateCandidate.inputText.trim();

      if (!inputText) {
        throw new BadRequestException('Input text is required.');
      }

      data.inputText = inputText;
    }

    if (updateCandidate.expectedOutput !== undefined) {
      data.expectedOutput =
        updateCandidate.expectedOutput as Prisma.InputJsonValue;
    }

    if (updateCandidate.instruction !== undefined) {
      const instruction = updateCandidate.instruction.trim();

      if (!instruction) {
        throw new BadRequestException('Instruction is required.');
      }

      data.instruction = instruction;
    }

    if (updateCandidate.reasoning !== undefined) {
      data.reasoning = updateCandidate.reasoning.trim() || null;
    }

    if (updateCandidate.status !== undefined) {
      data.status = updateCandidate.status;
    }

    const candidate = await this.prisma.trainingCandidate.update({
      where: { id: candidateId },
      data,
    });

    if (
      existingCandidate.status !== candidate.status &&
      candidate.status === TrainingCandidateStatus.APPROVED
    ) {
      await this.createFeedbackEvent(candidate, 'TRAINING_CANDIDATE_APPROVED');
    }

    if (
      existingCandidate.status !== candidate.status &&
      candidate.status === TrainingCandidateStatus.REJECTED
    ) {
      await this.createFeedbackEvent(candidate, 'TRAINING_CANDIDATE_REJECTED');
    }

    return this.toTrainingCandidate(candidate);
  }

  async remove(candidateId: string): Promise<void> {
    await this.findCandidateRecord(candidateId);

    await this.prisma.trainingCandidate.delete({
      where: { id: candidateId },
    });
  }

  private async validateSourceOwnership(
    workspaceId: string,
    source: {
      documentId?: string;
      annotationId?: string;
    },
  ): Promise<void> {
    if (source.documentId) {
      const document = await this.documentsService.findOne(source.documentId);

      if (document.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Document must belong to the same workspace.',
        );
      }
    }

    if (source.annotationId) {
      const annotation = await this.prisma.annotation.findUnique({
        where: { id: source.annotationId },
      });

      if (!annotation) {
        throw new NotFoundException(
          `Annotation ${source.annotationId} was not found.`,
        );
      }

      if (annotation.workspaceId !== workspaceId) {
        throw new BadRequestException(
          'Annotation must belong to the same workspace.',
        );
      }
    }
  }

  private async findCandidateRecord(candidateId: string) {
    const candidate = await this.prisma.trainingCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(
        `Training candidate ${candidateId} was not found.`,
      );
    }

    return candidate;
  }

  private createFeedbackEvent(
    candidate: {
      id: string;
      workspaceId: string;
      documentId: string | null;
      annotationId: string | null;
      candidateType: TrainingCandidateType;
      status: TrainingCandidateStatus;
    },
    eventType:
      | 'TRAINING_CANDIDATE_CREATED'
      | 'TRAINING_CANDIDATE_APPROVED'
      | 'TRAINING_CANDIDATE_REJECTED',
  ) {
    return this.prisma.feedbackEvent.create({
      data: {
        workspaceId: candidate.workspaceId,
        documentId: candidate.documentId,
        annotationId: candidate.annotationId,
        eventType,
        payloadJson: {
          candidateId: candidate.id,
          candidateType: candidate.candidateType,
          status: candidate.status,
        },
      },
    });
  }

  private toTrainingCandidate(candidate: {
    id: string;
    workspaceId: string;
    documentId: string | null;
    annotationId: string | null;
    candidateType: TrainingCandidateType;
    inputText: string;
    expectedOutput: unknown;
    instruction: string;
    reasoning: string | null;
    status: TrainingCandidateStatus;
    createdAt: Date;
    updatedAt: Date;
  }): TrainingCandidate {
    return {
      id: candidate.id,
      workspaceId: candidate.workspaceId,
      documentId: candidate.documentId || undefined,
      annotationId: candidate.annotationId || undefined,
      candidateType: candidate.candidateType,
      inputText: candidate.inputText,
      expectedOutput: candidate.expectedOutput as Record<string, unknown>,
      instruction: candidate.instruction,
      reasoning: candidate.reasoning || undefined,
      status: candidate.status,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
    };
  }
}
