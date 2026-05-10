import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Annotation,
  CreateAnnotationRequest,
  LinkedOperationalRule,
  UpdateAnnotationRequest,
} from '@task-mind/shared';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  async create(
    documentId: string,
    createAnnotation: CreateAnnotationRequest,
  ): Promise<Annotation> {
    const document = await this.documentsService.findOne(documentId);
    const fieldName = createAnnotation.fieldName.trim();
    const selectedText = createAnnotation.selectedText.trim();
    const explanation = createAnnotation.explanation?.trim() || undefined;

    if (!fieldName) {
      throw new BadRequestException('Field name is required.');
    }

    if (!selectedText) {
      throw new BadRequestException('Selected text is required.');
    }

    const context = this.extractContext(document.extractedText, {
      selectedText,
      startOffset: createAnnotation.startOffset,
      endOffset: createAnnotation.endOffset,
    });

    const annotation = await this.prisma.annotation.create({
      data: {
        documentId: document.id,
        workspaceId: document.workspaceId,
        fieldName,
        selectedText,
        explanation,
        startOffset: createAnnotation.startOffset,
        endOffset: createAnnotation.endOffset,
        contextBefore: context.contextBefore,
        contextAfter: context.contextAfter,
      },
    });

    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId: document.workspaceId,
        documentId: document.id,
        annotationId: annotation.id,
        eventType: 'ANNOTATION_CREATED',
        payloadJson: {
          fieldName: annotation.fieldName,
          selectedText: annotation.selectedText,
          startOffset: annotation.startOffset,
          endOffset: annotation.endOffset,
        },
      },
    });

    return this.toAnnotation(annotation);
  }

  async findByDocument(documentId: string): Promise<Annotation[]> {
    await this.documentsService.findOne(documentId);

    const annotations = await this.prisma.annotation.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return annotations.map((annotation) => this.toAnnotation(annotation));
  }

  async update(
    annotationId: string,
    updateAnnotation: UpdateAnnotationRequest,
  ): Promise<Annotation> {
    const annotation = await this.findOne(annotationId);
    const fieldName = updateAnnotation.fieldName.trim();
    const explanation = updateAnnotation.explanation?.trim() || undefined;

    if (!fieldName) {
      throw new BadRequestException('Field name is required.');
    }

    const updatedAnnotation = await this.prisma.annotation.update({
      where: { id: annotationId },
      data: {
        fieldName,
        explanation,
      },
    });

    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId: annotation.workspaceId,
        documentId: annotation.documentId,
        annotationId,
        eventType: 'ANNOTATION_UPDATED',
        payloadJson: {
          previousFieldName: annotation.fieldName,
          fieldName: updatedAnnotation.fieldName,
          selectedText: updatedAnnotation.selectedText,
          explanation: updatedAnnotation.explanation,
        },
      },
    });

    return this.toAnnotation(updatedAnnotation);
  }

  async remove(annotationId: string): Promise<void> {
    const annotation = await this.findOne(annotationId);

    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId: annotation.workspaceId,
        documentId: annotation.documentId,
        annotationId,
        eventType: 'ANNOTATION_DELETED',
        payloadJson: {
          fieldName: annotation.fieldName,
          selectedText: annotation.selectedText,
        },
      },
    });

    await this.prisma.annotation.delete({ where: { id: annotationId } });
  }

  async linkRule(
    annotationId: string,
    ruleId: string,
  ): Promise<LinkedOperationalRule> {
    const { annotation, rule } = await this.findAnnotationAndRule(
      annotationId,
      ruleId,
    );

    const existingLink = await this.prisma.annotationRuleLink.findUnique({
      where: { annotationId_ruleId: { annotationId, ruleId } },
    });

    if (existingLink) {
      throw new ConflictException('Rule is already linked to this annotation.');
    }

    const [link] = await this.prisma.$transaction([
      this.prisma.annotationRuleLink.create({
        data: {
          annotationId,
          ruleId,
          workspaceId: annotation.workspaceId,
        },
        include: { rule: true },
      }),
      this.prisma.feedbackEvent.create({
        data: {
          workspaceId: annotation.workspaceId,
          documentId: annotation.documentId,
          annotationId,
          eventType: 'ANNOTATION_RULE_LINKED',
          payloadJson: {
            ruleId: rule.id,
            ruleTitle: rule.title,
            fieldName: annotation.fieldName,
          },
        },
      }),
    ]);

    return this.toLinkedOperationalRule(link);
  }

  async unlinkRule(annotationId: string, ruleId: string): Promise<void> {
    const { annotation, rule } = await this.findAnnotationAndRule(
      annotationId,
      ruleId,
    );

    const link = await this.prisma.annotationRuleLink.findUnique({
      where: { annotationId_ruleId: { annotationId, ruleId } },
    });

    if (!link) {
      throw new NotFoundException('Rule link was not found.');
    }

    await this.prisma.$transaction([
      this.prisma.feedbackEvent.create({
        data: {
          workspaceId: annotation.workspaceId,
          documentId: annotation.documentId,
          annotationId,
          eventType: 'ANNOTATION_RULE_UNLINKED',
          payloadJson: {
            ruleId: rule.id,
            ruleTitle: rule.title,
            fieldName: annotation.fieldName,
          },
        },
      }),
      this.prisma.annotationRuleLink.delete({
        where: { annotationId_ruleId: { annotationId, ruleId } },
      }),
    ]);
  }

  async findLinkedRules(annotationId: string): Promise<LinkedOperationalRule[]> {
    await this.findOne(annotationId);

    const links = await this.prisma.annotationRuleLink.findMany({
      where: { annotationId },
      include: { rule: true },
      orderBy: { createdAt: 'desc' },
    });

    return links.map((link) => this.toLinkedOperationalRule(link));
  }

  private async findOne(annotationId: string): Promise<Annotation> {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id: annotationId },
    });

    if (!annotation) {
      throw new NotFoundException(`Annotation ${annotationId} was not found.`);
    }

    return this.toAnnotation(annotation);
  }

  private async findAnnotationAndRule(annotationId: string, ruleId: string) {
    const [annotation, rule] = await Promise.all([
      this.prisma.annotation.findUnique({ where: { id: annotationId } }),
      this.prisma.operationalRule.findUnique({ where: { id: ruleId } }),
    ]);

    if (!annotation) {
      throw new NotFoundException(`Annotation ${annotationId} was not found.`);
    }

    if (!rule) {
      throw new NotFoundException(`Rule ${ruleId} was not found.`);
    }

    if (annotation.workspaceId !== rule.workspaceId) {
      throw new BadRequestException(
        'Annotation and rule must belong to the same workspace.',
      );
    }

    return { annotation, rule };
  }

  private extractContext(
    extractedText: string | null,
    selection: {
      selectedText: string;
      startOffset?: number;
      endOffset?: number;
    },
  ): Pick<Annotation, 'contextBefore' | 'contextAfter'> {
    if (!extractedText) {
      return {};
    }

    const hasValidOffsets =
      selection.startOffset !== undefined &&
      selection.endOffset !== undefined &&
      selection.startOffset >= 0 &&
      selection.endOffset >= selection.startOffset &&
      selection.endOffset <= extractedText.length;

    const startOffset = hasValidOffsets
      ? (selection.startOffset as number)
      : extractedText.indexOf(selection.selectedText);

    if (startOffset < 0) {
      return {};
    }

    const endOffset = hasValidOffsets
      ? (selection.endOffset as number)
      : startOffset + selection.selectedText.length;

    return {
      contextBefore:
        extractedText.slice(Math.max(0, startOffset - 200), startOffset) ||
        undefined,
      contextAfter:
        extractedText.slice(endOffset, endOffset + 200) || undefined,
    };
  }

  private toAnnotation(annotation: {
    id: string;
    documentId: string;
    workspaceId: string;
    fieldName: string;
    selectedText: string;
    explanation: string | null;
    startOffset: number | null;
    endOffset: number | null;
    contextBefore: string | null;
    contextAfter: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Annotation {
    return {
      id: annotation.id,
      documentId: annotation.documentId,
      workspaceId: annotation.workspaceId,
      fieldName: annotation.fieldName,
      selectedText: annotation.selectedText,
      explanation: annotation.explanation || undefined,
      startOffset: annotation.startOffset ?? undefined,
      endOffset: annotation.endOffset ?? undefined,
      contextBefore: annotation.contextBefore || undefined,
      contextAfter: annotation.contextAfter || undefined,
      createdAt: annotation.createdAt.toISOString(),
      updatedAt: annotation.updatedAt.toISOString(),
    };
  }

  private toLinkedOperationalRule(link: {
    id: string;
    createdAt: Date;
    rule: {
      id: string;
      workspaceId: string;
      title: string;
      ruleText: string;
      category: LinkedOperationalRule['category'];
      source: LinkedOperationalRule['source'];
      confidence: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }): LinkedOperationalRule {
    return {
      linkId: link.id,
      linkedAt: link.createdAt.toISOString(),
      id: link.rule.id,
      workspaceId: link.rule.workspaceId,
      title: link.rule.title,
      ruleText: link.rule.ruleText,
      category: link.rule.category,
      source: link.rule.source,
      confidence: link.rule.confidence,
      createdAt: link.rule.createdAt.toISOString(),
      updatedAt: link.rule.updatedAt.toISOString(),
    };
  }
}
