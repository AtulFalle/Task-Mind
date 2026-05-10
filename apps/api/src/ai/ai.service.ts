import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AiSuggestionStatus,
  ExtractedTextStatus,
  type AiAnnotationSuggestion,
  type AiAnnotationSuggestionsResponse,
  type AiSuggestion,
  type RejectAiSuggestionRequest,
  type UpdateAiSuggestionRequest,
} from '@task-mind/shared';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

interface AiServiceResponse {
  suggestions?: unknown;
}

@Injectable()
export class AiService {
  private readonly aiServiceUrl =
    process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';
  private readonly timeoutMs = Number(
    process.env.AI_SERVICE_TIMEOUT_MS ?? 160000,
  );

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async suggestAnnotations(
    documentId: string,
  ): Promise<AiAnnotationSuggestionsResponse> {
    const document = await this.documentsService.findOne(documentId);

    if (
      document.extractedTextStatus !== ExtractedTextStatus.COMPLETED ||
      !document.extractedText?.trim()
    ) {
      throw new BadRequestException(
        'Document text must be extracted before AI suggestions can run.',
      );
    }

    const [workspace, rules, annotations, previousSuggestions] =
      await Promise.all([
        this.workspacesService.findOne(document.workspaceId),
        this.prisma.operationalRule.findMany({
          where: { workspaceId: document.workspaceId },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.annotation.findMany({
          where: { documentId: document.id },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.aiSuggestion.findMany({
          where: {
            workspaceId: document.workspaceId,
            status: {
              in: [
                AiSuggestionStatus.APPROVED,
                AiSuggestionStatus.REJECTED,
                AiSuggestionStatus.EDITED,
              ],
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ]);

    const response = await this.callAiService({
      workspace,
      document,
      extractedText: document.extractedText,
      rules: rules.map((rule) => ({
        id: rule.id,
        title: rule.title,
        ruleText: rule.ruleText,
        category: rule.category,
        source: rule.source,
        confidence: rule.confidence,
      })),
      existingAnnotations: annotations.map((annotation) => ({
        id: annotation.id,
        fieldName: annotation.fieldName,
        selectedText: annotation.selectedText,
        explanation: annotation.explanation,
        contextBefore: annotation.contextBefore,
        contextAfter: annotation.contextAfter,
      })),
      previousAiSuggestions: previousSuggestions.map((suggestion) => ({
        id: suggestion.id,
        status: suggestion.status,
        fieldName: suggestion.fieldName,
        selectedText: suggestion.selectedText,
        reasoning: suggestion.reasoning,
        correctedFieldName: suggestion.correctedFieldName,
        correctedSelectedText: suggestion.correctedSelectedText,
        correctedReasoning: suggestion.correctedReasoning,
      })),
    });

    const suggestions = this.toSuggestions(response.suggestions);
    const persistedSuggestions = await Promise.all(
      suggestions.map((suggestion) =>
        this.createSuggestion(document, suggestion),
      ),
    );

    return { suggestions: persistedSuggestions };
  }

  async findByDocument(documentId: string): Promise<AiSuggestion[]> {
    await this.documentsService.findOne(documentId);

    const suggestions = await this.prisma.aiSuggestion.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return suggestions.map((suggestion) => this.toAiSuggestion(suggestion));
  }

  async approve(suggestionId: string): Promise<AiSuggestion> {
    const suggestion = await this.findOne(suggestionId);

    const updatedSuggestion = await this.prisma.aiSuggestion.update({
      where: { id: suggestion.id },
      data: { status: AiSuggestionStatus.APPROVED },
    });

    await this.createFeedbackEvent(
      updatedSuggestion,
      'AI_SUGGESTION_APPROVED',
      {
        suggestion: this.toSuggestionPayload(updatedSuggestion),
      },
    );

    return this.toAiSuggestion(updatedSuggestion);
  }

  async reject(
    suggestionId: string,
    request: RejectAiSuggestionRequest,
  ): Promise<AiSuggestion> {
    const suggestion = await this.findOne(suggestionId);
    const reason = request.reason?.trim() || undefined;

    const updatedSuggestion = await this.prisma.aiSuggestion.update({
      where: { id: suggestion.id },
      data: { status: AiSuggestionStatus.REJECTED },
    });

    await this.createFeedbackEvent(
      updatedSuggestion,
      'AI_SUGGESTION_REJECTED',
      {
        suggestion: this.toSuggestionPayload(updatedSuggestion),
        reason,
      },
    );

    return this.toAiSuggestion(updatedSuggestion);
  }

  async edit(
    suggestionId: string,
    request: UpdateAiSuggestionRequest,
  ): Promise<AiSuggestion> {
    const suggestion = await this.findOne(suggestionId);
    const correctedFieldName = request.correctedFieldName.trim();
    const correctedSelectedText = request.correctedSelectedText.trim();
    const correctedReasoning = request.correctedReasoning.trim();

    if (!correctedFieldName || !correctedSelectedText || !correctedReasoning) {
      throw new BadRequestException('Correction fields are required.');
    }

    const updatedSuggestion = await this.prisma.aiSuggestion.update({
      where: { id: suggestion.id },
      data: {
        correctedFieldName,
        correctedSelectedText,
        correctedReasoning,
        status: AiSuggestionStatus.EDITED,
      },
    });

    await this.createFeedbackEvent(updatedSuggestion, 'AI_SUGGESTION_EDITED', {
      originalSuggestion: this.toSuggestionPayload(suggestion),
      correctedSuggestion: this.toCorrectedSuggestionPayload(updatedSuggestion),
    });

    return this.toAiSuggestion(updatedSuggestion);
  }

  async convertToAnnotation(suggestionId: string): Promise<AiSuggestion> {
    const suggestion = await this.findOne(suggestionId);
    const fieldName = (
      suggestion.correctedFieldName || suggestion.fieldName
    ).trim();
    const selectedText = (
      suggestion.correctedSelectedText || suggestion.selectedText
    ).trim();
    const explanation = (
      suggestion.correctedReasoning || suggestion.reasoning
    ).trim();

    if (!fieldName || !selectedText) {
      throw new BadRequestException('Suggestion cannot be converted.');
    }

    const updatedSuggestion = await this.prisma.$transaction(async (tx) => {
      const annotation = await tx.annotation.create({
        data: {
          workspaceId: suggestion.workspaceId,
          documentId: suggestion.documentId,
          fieldName,
          selectedText,
          explanation,
        },
      });

      const convertedSuggestion = await tx.aiSuggestion.update({
        where: { id: suggestion.id },
        data: {
          annotationId: annotation.id,
          status: AiSuggestionStatus.CONVERTED_TO_ANNOTATION,
        },
      });

      await tx.feedbackEvent.createMany({
        data: [
          {
            workspaceId: suggestion.workspaceId,
            documentId: suggestion.documentId,
            annotationId: annotation.id,
            eventType: 'AI_SUGGESTION_CONVERTED_TO_ANNOTATION',
            payloadJson: {
              suggestionId: suggestion.id,
              fieldName,
              selectedText,
              reasoning: explanation,
            },
          },
          {
            workspaceId: suggestion.workspaceId,
            documentId: suggestion.documentId,
            annotationId: annotation.id,
            eventType: 'ANNOTATION_CREATED',
            payloadJson: {
              fieldName,
              selectedText,
              source: 'AI_SUGGESTION',
              suggestionId: suggestion.id,
            },
          },
        ],
      });

      return convertedSuggestion;
    });

    return this.toAiSuggestion(updatedSuggestion);
  }

  private async callAiService(payload: unknown): Promise<AiServiceResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.aiServiceUrl}/suggest-annotations`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(
          `AI service returned ${response.status}.`,
        );
      }

      return (await response.json()) as AiServiceResponse;
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

  private async createSuggestion(
    document: { id: string; workspaceId: string },
    suggestion: AiAnnotationSuggestion,
  ): Promise<AiSuggestion> {
    const persistedSuggestion = await this.prisma.aiSuggestion.create({
      data: {
        workspaceId: document.workspaceId,
        documentId: document.id,
        fieldName: suggestion.fieldName,
        selectedText: suggestion.selectedText,
        reasoning: suggestion.reasoning,
        confidence: suggestion.confidence,
        status: AiSuggestionStatus.PENDING,
      },
    });

    await this.createFeedbackEvent(
      persistedSuggestion,
      'AI_SUGGESTION_CREATED',
      {
        suggestion: this.toSuggestionPayload(persistedSuggestion),
      },
    );

    return this.toAiSuggestion(persistedSuggestion);
  }

  private async findOne(suggestionId: string) {
    const suggestion = await this.prisma.aiSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new NotFoundException(
        `AI suggestion ${suggestionId} was not found.`,
      );
    }

    return suggestion;
  }

  private async createFeedbackEvent(
    suggestion: {
      id: string;
      workspaceId: string;
      documentId: string;
      annotationId?: string | null;
    },
    eventType:
      | 'AI_SUGGESTION_CREATED'
      | 'AI_SUGGESTION_APPROVED'
      | 'AI_SUGGESTION_REJECTED'
      | 'AI_SUGGESTION_EDITED',
    payloadJson: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId: suggestion.workspaceId,
        documentId: suggestion.documentId,
        annotationId: suggestion.annotationId ?? undefined,
        eventType,
        payloadJson: {
          suggestionId: suggestion.id,
          ...payloadJson,
        },
      },
    });
  }

  private toSuggestions(value: unknown): AiAnnotationSuggestion[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((suggestion) => this.toSuggestion(suggestion))
      .filter((suggestion): suggestion is AiAnnotationSuggestion =>
        Boolean(suggestion),
      );
  }

  private toSuggestion(value: unknown): AiAnnotationSuggestion | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const suggestion = value as Partial<AiAnnotationSuggestion>;
    const fieldName = suggestion.fieldName?.trim();
    const selectedText = suggestion.selectedText?.trim();
    const reasoning = suggestion.reasoning?.trim();
    const confidence = Number(suggestion.confidence);

    if (!fieldName || !selectedText || !reasoning || Number.isNaN(confidence)) {
      return null;
    }

    return {
      fieldName,
      selectedText,
      reasoning,
      confidence: Math.min(1, Math.max(0, confidence)),
    };
  }

  private toSuggestionPayload(
    suggestion: AiAnnotationSuggestion,
  ): Record<string, string | number> {
    return {
      fieldName: suggestion.fieldName,
      selectedText: suggestion.selectedText,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
    };
  }

  private toCorrectedSuggestionPayload(suggestion: {
    correctedFieldName: string | null;
    correctedSelectedText: string | null;
    correctedReasoning: string | null;
    confidence: number;
  }): Record<string, string | number | null> {
    return {
      fieldName: suggestion.correctedFieldName,
      selectedText: suggestion.correctedSelectedText,
      reasoning: suggestion.correctedReasoning,
      confidence: suggestion.confidence,
    };
  }

  private toAiSuggestion(suggestion: {
    id: string;
    workspaceId: string;
    documentId: string;
    annotationId: string | null;
    fieldName: string;
    selectedText: string;
    reasoning: string;
    confidence: number;
    status: AiSuggestion['status'];
    correctedFieldName: string | null;
    correctedSelectedText: string | null;
    correctedReasoning: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AiSuggestion {
    return {
      id: suggestion.id,
      workspaceId: suggestion.workspaceId,
      documentId: suggestion.documentId,
      annotationId: suggestion.annotationId ?? undefined,
      fieldName: suggestion.fieldName,
      selectedText: suggestion.selectedText,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
      status: suggestion.status,
      correctedFieldName: suggestion.correctedFieldName ?? undefined,
      correctedSelectedText: suggestion.correctedSelectedText ?? undefined,
      correctedReasoning: suggestion.correctedReasoning ?? undefined,
      createdAt: suggestion.createdAt.toISOString(),
      updatedAt: suggestion.updatedAt.toISOString(),
    };
  }
}
