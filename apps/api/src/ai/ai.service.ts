import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AiSuggestionStatus,
  DocumentType,
  ExtractedTextStatus,
  SuggestionMode,
  type AiAnnotationSuggestion,
  type AiAnnotationSuggestionsResponse,
  type AiContextStats,
  type AiSuggestion,
  type AiSuggestionRequest,
  type ApplicabilityResult,
  type DocumentClassificationContext,
  type DocumentTypeClassification,
  type RejectAiSuggestionRequest,
  type UpdateAiSuggestionRequest,
} from '@task-mind/shared';
import { AiContextBuilderService } from '../app/modules/ai-orchestration/services/ai-context-builder.service';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

interface AiServiceResponse {
  suggestions?: unknown;
  classification?: unknown;
  documentType?: unknown;
  reasoning?: unknown;
  confidence?: unknown;
  applicability?: unknown;
}

interface DocumentClassificationPayload {
  documentText: string;
  context: DocumentClassificationContext;
}

const DOCUMENT_TYPES = new Set<string>(Object.values(DocumentType));
const MAX_CLASSIFICATION_DOCUMENT_CHARS = 4000;

@Injectable()
export class AiService {
  private readonly aiServiceUrl =
    process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';
  private readonly timeoutMs = Number(
    process.env.AI_SERVICE_TIMEOUT_MS ?? 160000,
  );

  constructor(
    private readonly aiContextBuilder: AiContextBuilderService,
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async suggest(
    documentId: string,
    request: AiSuggestionRequest = {},
  ): Promise<AiAnnotationSuggestionsResponse> {
    const mode = request.mode ?? SuggestionMode.EXTRACTION;

    if (mode === SuggestionMode.DOCUMENT_CLASSIFICATION) {
      return this.suggestDocumentClassification(documentId);
    }

    return this.suggestAnnotations(documentId);
  }

  private async suggestAnnotations(
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
            mode: SuggestionMode.EXTRACTION,
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

    const response = await this.callAiService('/suggest-annotations', {
      workspace,
      document,
      extractedText: document.extractedText,
      rules: this.toRuleContext(rules),
      existingAnnotations: annotations.map((annotation) => ({
        id: annotation.id,
        fieldName: annotation.fieldName,
        selectedText: annotation.selectedText,
        explanation: annotation.explanation,
        contextBefore: annotation.contextBefore,
        contextAfter: annotation.contextAfter,
      })),
      previousAiSuggestions: previousSuggestions.map((suggestion) =>
        this.toPreviousSuggestionContext(suggestion),
      ),
    });

    const suggestions = this.toSuggestions(response.suggestions);
    const persistedSuggestions = await Promise.all(
      suggestions.map((suggestion) =>
        this.createExtractionSuggestion(document, suggestion),
      ),
    );

    return { suggestions: persistedSuggestions };
  }

  private async suggestDocumentClassification(
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

    const { context, contextStats } =
      await this.aiContextBuilder.buildDocumentClassificationContext(
        document.workspaceId,
      );
    const documentText = document.extractedText;
    const payload: DocumentClassificationPayload = {
      documentText: documentText.slice(0, MAX_CLASSIFICATION_DOCUMENT_CHARS),
      context,
    };

    this.logClassificationContextSummary(document.id, contextStats);

    const response = await this.callAiService(
      '/suggest-document-classification',
      payload,
    );

    const classification = this.toClassification(
      response.classification ?? response,
    );
    const persistedSuggestion = await this.createClassificationSuggestion(
      document,
      classification,
      contextStats,
    );

    return { suggestions: [persistedSuggestion], contextStats };
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

    const updatedSuggestion = await this.prisma.aiSuggestion.update({
      where: { id: suggestion.id },
      data: {
        ...this.toCorrectionData(suggestion, request),
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

    if (suggestion.mode !== SuggestionMode.EXTRACTION) {
      throw new BadRequestException('Only extraction suggestions can be converted.');
    }
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

  private async callAiService(
    path: '/suggest-annotations' | '/suggest-document-classification',
    payload: unknown,
  ): Promise<AiServiceResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.aiServiceUrl}${path}`, {
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

  private async createExtractionSuggestion(
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
        mode: SuggestionMode.EXTRACTION,
        payloadJson: this.toSuggestionPayload(
          suggestion,
        ) as Prisma.InputJsonObject,
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

  private async createClassificationSuggestion(
    document: { id: string; workspaceId: string; extractedText: string | null },
    classification: DocumentTypeClassification,
    contextStats: AiContextStats,
  ): Promise<AiSuggestion> {
    const persistedSuggestion = await this.prisma.aiSuggestion.create({
      data: {
        workspaceId: document.workspaceId,
        documentId: document.id,
        fieldName: 'documentType',
        selectedText: classification.documentType,
        reasoning: classification.reasoning,
        confidence: classification.confidence,
        mode: SuggestionMode.DOCUMENT_CLASSIFICATION,
        payloadJson: {
          documentType: classification.documentType,
          reasoning: classification.reasoning,
          confidence: classification.confidence,
          applicability: this.toApplicabilityPayload(
            classification.applicability ??
              this.toDefaultApplicability(classification.documentType),
          ),
          contextStats: this.toContextStatsPayload(contextStats),
        } as Prisma.InputJsonObject,
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

  private toClassification(value: unknown): DocumentTypeClassification {
    if (!value || typeof value !== 'object') {
      return {
        documentType: DocumentType.UNKNOWN,
        reasoning: 'The model did not return a valid classification.',
        confidence: 0,
        applicability: this.toDefaultApplicability(DocumentType.UNKNOWN),
      };
    }

    const classification = (
      'documentType' in value
        ? value
        : (value as { classification?: unknown }).classification
    ) as Partial<DocumentTypeClassification> | undefined;

    if (!classification || typeof classification !== 'object') {
      return {
        documentType: DocumentType.UNKNOWN,
        reasoning: 'The model did not return a valid classification.',
        confidence: 0,
        applicability: this.toDefaultApplicability(DocumentType.UNKNOWN),
      };
    }

    const documentType = DOCUMENT_TYPES.has(String(classification.documentType))
      ? (classification.documentType as DocumentType)
      : DocumentType.UNKNOWN;
    const reasoning = classification.reasoning?.trim();
    const confidence = Number(classification.confidence);

    return {
      documentType,
      reasoning: reasoning || 'No auditable reasoning was returned.',
      confidence: Number.isNaN(confidence)
        ? 0
        : Math.min(1, Math.max(0, confidence)),
      applicability: this.toApplicability(
        classification.applicability,
        documentType,
      ),
    };
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

  private toSuggestionPayload(suggestion: {
    mode?: AiSuggestion['mode'];
    fieldName: string;
    selectedText: string;
    reasoning: string;
    confidence: number;
    payloadJson?: unknown;
  }): Record<string, unknown> {
    if (
      suggestion.mode === SuggestionMode.DOCUMENT_CLASSIFICATION &&
      suggestion.payloadJson &&
      typeof suggestion.payloadJson === 'object'
    ) {
      return suggestion.payloadJson as Record<string, unknown>;
    }

    return {
      fieldName: suggestion.fieldName,
      selectedText: suggestion.selectedText,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
    };
  }

  private toCorrectedSuggestionPayload(suggestion: {
    mode?: AiSuggestion['mode'];
    correctedFieldName: string | null;
    correctedSelectedText: string | null;
    correctedReasoning: string | null;
    confidence: number;
    correctedPayloadJson?: unknown;
  }): Record<string, unknown> {
    if (
      suggestion.mode === SuggestionMode.DOCUMENT_CLASSIFICATION &&
      suggestion.correctedPayloadJson &&
      typeof suggestion.correctedPayloadJson === 'object'
    ) {
      return suggestion.correctedPayloadJson as Record<string, unknown>;
    }

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
    mode: AiSuggestion['mode'];
    payloadJson: unknown;
    status: AiSuggestion['status'];
    correctedFieldName: string | null;
    correctedSelectedText: string | null;
    correctedReasoning: string | null;
    correctedPayloadJson: unknown | null;
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
      mode: suggestion.mode,
      payloadJson: this.toRecord(suggestion.payloadJson),
      status: suggestion.status,
      correctedFieldName: suggestion.correctedFieldName ?? undefined,
      correctedSelectedText: suggestion.correctedSelectedText ?? undefined,
      correctedReasoning: suggestion.correctedReasoning ?? undefined,
      correctedPayloadJson: suggestion.correctedPayloadJson
        ? this.toRecord(suggestion.correctedPayloadJson)
        : undefined,
      createdAt: suggestion.createdAt.toISOString(),
      updatedAt: suggestion.updatedAt.toISOString(),
    };
  }

  private toRuleContext(
    rules: {
      id: string;
      title: string;
      ruleText: string;
      category: string;
      source: string;
      confidence: number;
    }[],
  ) {
    return rules.map((rule) => ({
      id: rule.id,
      title: rule.title,
      ruleText: rule.ruleText,
      category: rule.category,
      source: rule.source,
      confidence: rule.confidence,
    }));
  }

  private toPreviousSuggestionContext(suggestion: {
    id: string;
    status: AiSuggestion['status'];
    mode: AiSuggestion['mode'];
    fieldName: string;
    selectedText: string;
    reasoning: string;
    confidence: number;
    payloadJson: unknown;
    correctedFieldName: string | null;
    correctedSelectedText: string | null;
    correctedReasoning: string | null;
    correctedPayloadJson: unknown | null;
  }): Record<string, unknown> {
    return {
      id: suggestion.id,
      status: suggestion.status,
      mode: suggestion.mode,
      fieldName: suggestion.fieldName,
      selectedText: suggestion.selectedText,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
      payloadJson: this.toRecord(suggestion.payloadJson),
      correctedFieldName: suggestion.correctedFieldName,
      correctedSelectedText: suggestion.correctedSelectedText,
      correctedReasoning: suggestion.correctedReasoning,
      correctedPayloadJson: suggestion.correctedPayloadJson
        ? this.toRecord(suggestion.correctedPayloadJson)
        : null,
    };
  }

  private toCorrectionData(
    suggestion: {
      mode: AiSuggestion['mode'];
      reasoning: string;
      confidence: number;
      payloadJson: unknown;
    },
    request: UpdateAiSuggestionRequest,
  ) {
    if (suggestion.mode === SuggestionMode.DOCUMENT_CLASSIFICATION) {
      const correctedDocumentType = request.correctedDocumentType;

      if (!correctedDocumentType || !DOCUMENT_TYPES.has(correctedDocumentType)) {
        throw new BadRequestException('A corrected document type is required.');
      }

      const correctedReasoning =
        request.correctedReasoning?.trim() ||
        'Human corrected the document type classification.';

      return {
        correctedFieldName: 'documentType',
        correctedSelectedText: correctedDocumentType,
        correctedReasoning,
        correctedPayloadJson: {
          documentType: correctedDocumentType,
          reasoning: correctedReasoning,
          confidence: suggestion.confidence,
          applicability: this.toApplicabilityPayload(
            this.toCorrectedApplicability(
              suggestion.payloadJson,
              correctedDocumentType,
            ),
          ),
        } as Prisma.InputJsonObject,
        status: AiSuggestionStatus.EDITED,
      };
    }

    const correctedFieldName = request.correctedFieldName?.trim();
    const correctedSelectedText = request.correctedSelectedText?.trim();
    const correctedReasoning = request.correctedReasoning?.trim();

    if (!correctedFieldName || !correctedSelectedText || !correctedReasoning) {
      throw new BadRequestException('Correction fields are required.');
    }

    return {
      correctedFieldName,
      correctedSelectedText,
      correctedReasoning,
      correctedPayloadJson: {
        fieldName: correctedFieldName,
        selectedText: correctedSelectedText,
        reasoning: correctedReasoning,
        confidence: suggestion.confidence,
      } as Prisma.InputJsonObject,
      status: AiSuggestionStatus.EDITED,
    };
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  }

  private toApplicability(
    value: unknown,
    documentType: DocumentType,
  ): ApplicabilityResult {
    const fallback = this.toDefaultApplicability(documentType);

    if (!value || typeof value !== 'object') {
      return fallback;
    }

    const applicability = value as Partial<ApplicabilityResult>;

    return {
      isApplicable:
        typeof applicability.isApplicable === 'boolean'
          ? applicability.isApplicable
          : fallback.isApplicable,
      matchedSignals: this.toStringList(applicability.matchedSignals),
      missingSignals: this.toStringList(applicability.missingSignals),
    };
  }

  private toCorrectedApplicability(
    payloadJson: unknown,
    correctedDocumentType: DocumentType,
  ): ApplicabilityResult {
    const existingApplicability = this.toRecord(payloadJson)['applicability'];

    if (correctedDocumentType === DocumentType.UNKNOWN) {
      return {
        isApplicable: false,
        matchedSignals: [],
        missingSignals:
          this.toApplicability(existingApplicability, correctedDocumentType)
            .missingSignals,
      };
    }

    return this.toApplicability(existingApplicability, correctedDocumentType);
  }

  private toDefaultApplicability(
    documentType: DocumentType,
  ): ApplicabilityResult {
    return {
      isApplicable: documentType !== DocumentType.UNKNOWN,
      matchedSignals: [],
      missingSignals:
        documentType === DocumentType.UNKNOWN
          ? [
              'invoice number',
              'resume sections',
              'transaction table',
              'customer request',
            ]
          : [],
    };
  }

  private toApplicabilityPayload(
    applicability: ApplicabilityResult,
  ): Prisma.InputJsonObject {
    return {
      isApplicable: applicability.isApplicable,
      matchedSignals: applicability.matchedSignals,
      missingSignals: applicability.missingSignals,
    };
  }

  private toContextStatsPayload(
    contextStats: AiContextStats,
  ): Prisma.InputJsonObject {
    return {
      rulesUsed: contextStats.rulesUsed,
      approvedExamplesUsed: contextStats.approvedExamplesUsed,
      correctedExamplesUsed: contextStats.correctedExamplesUsed,
      rejectedExamplesUsed: contextStats.rejectedExamplesUsed,
    };
  }

  private toStringList(value: unknown): string[] {
    return Array.isArray(value)
      ? value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }

  private logClassificationContextSummary(
    documentId: string,
    contextStats: AiContextStats,
  ): void {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    console.log('AI classification context summary', {
      documentId,
      documentTextChars: MAX_CLASSIFICATION_DOCUMENT_CHARS,
      ...contextStats,
    });
  }
}
