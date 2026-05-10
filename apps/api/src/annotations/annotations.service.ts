import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Annotation,
  CreateAnnotationRequest,
  UpdateAnnotationRequest,
} from '@task-mind/shared';
import { randomUUID } from 'node:crypto';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class AnnotationsService {
  private readonly annotations = new Map<string, Annotation>();

  constructor(private readonly documentsService: DocumentsService) {}

  create(
    documentId: string,
    createAnnotation: CreateAnnotationRequest,
  ): Annotation {
    const document = this.documentsService.findOne(documentId);
    const fieldName = createAnnotation.fieldName.trim();
    const selectedText = createAnnotation.selectedText.trim();
    const explanation = createAnnotation.explanation?.trim() || undefined;

    if (!fieldName) {
      throw new BadRequestException('Field name is required.');
    }

    if (!selectedText) {
      throw new BadRequestException('Selected text is required.');
    }

    const now = new Date().toISOString();
    const annotation: Annotation = {
      id: randomUUID(),
      documentId: document.id,
      workspaceId: document.workspaceId,
      fieldName,
      selectedText,
      explanation,
      startOffset: createAnnotation.startOffset,
      endOffset: createAnnotation.endOffset,
      createdAt: now,
      updatedAt: now,
    };

    this.annotations.set(annotation.id, annotation);

    return annotation;
  }

  findByDocument(documentId: string): Annotation[] {
    this.documentsService.findOne(documentId);

    return Array.from(this.annotations.values())
      .filter((annotation) => annotation.documentId === documentId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  update(
    annotationId: string,
    updateAnnotation: UpdateAnnotationRequest,
  ): Annotation {
    const annotation = this.findOne(annotationId);
    const fieldName = updateAnnotation.fieldName.trim();
    const selectedText = updateAnnotation.selectedText.trim();
    const explanation = updateAnnotation.explanation?.trim() || undefined;

    if (!fieldName) {
      throw new BadRequestException('Field name is required.');
    }

    if (!selectedText) {
      throw new BadRequestException('Selected text is required.');
    }

    const updatedAnnotation: Annotation = {
      ...annotation,
      fieldName,
      selectedText,
      explanation,
      startOffset: updateAnnotation.startOffset,
      endOffset: updateAnnotation.endOffset,
      updatedAt: new Date().toISOString(),
    };

    this.annotations.set(annotationId, updatedAnnotation);

    return updatedAnnotation;
  }

  remove(annotationId: string): void {
    if (!this.annotations.delete(annotationId)) {
      throw new NotFoundException(`Annotation ${annotationId} was not found.`);
    }
  }

  private findOne(annotationId: string): Annotation {
    const annotation = this.annotations.get(annotationId);

    if (!annotation) {
      throw new NotFoundException(`Annotation ${annotationId} was not found.`);
    }

    return annotation;
  }
}
