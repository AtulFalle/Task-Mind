import { Injectable } from '@nestjs/common';
import type { FeedbackEvent } from '@task-mind/shared';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findByWorkspace(workspaceId: string): Promise<FeedbackEvent[]> {
    await this.workspacesService.findOne(workspaceId);

    const events = await this.prisma.feedbackEvent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => this.toFeedbackEvent(event));
  }

  async findByDocument(documentId: string): Promise<FeedbackEvent[]> {
    const document = await this.documentsService.findOne(documentId);

    const events = await this.prisma.feedbackEvent.findMany({
      where: {
        documentId: document.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => this.toFeedbackEvent(event));
  }

  private toFeedbackEvent(event: {
    id: string;
    workspaceId: string;
    documentId: string | null;
    annotationId: string | null;
    eventType: FeedbackEvent['eventType'];
    payloadJson: unknown;
    createdAt: Date;
  }): FeedbackEvent {
    return {
      id: event.id,
      workspaceId: event.workspaceId,
      documentId: event.documentId || undefined,
      annotationId: event.annotationId || undefined,
      eventType: event.eventType,
      payloadJson: this.toPayload(event.payloadJson),
      createdAt: event.createdAt.toISOString(),
    };
  }

  private toPayload(payloadJson: unknown): Record<string, unknown> {
    return payloadJson && typeof payloadJson === 'object'
      ? { ...(payloadJson as Record<string, unknown>) }
      : {};
  }
}
