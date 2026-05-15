import { Injectable } from '@nestjs/common';
import { AiSuggestionStatus, DocumentType, RuleCategory } from '@task-mind/shared';
import type {
  AiContextStats,
  DocumentClassificationContext,
  DocumentClassificationExample,
  DocumentClassificationRuleContext,
} from '@task-mind/shared';
import { PrismaService } from '../../../../prisma/prisma.service';

const MAX_RULES = 10;
const MAX_APPROVED_EXAMPLES = 5;
const MAX_CORRECTED_EXAMPLES = 5;
const MAX_REJECTED_EXAMPLES = 5;
const MAX_UNKNOWN_EXAMPLES = 5;
const MAX_REJECTION_EXAMPLES = 5;
const MAX_EXAMPLE_EXCERPT_CHARS = 500;

const CLASSIFICATION_LABELS: DocumentType[] = [
  DocumentType.INVOICE,
  DocumentType.RESUME,
  DocumentType.BANK_STATEMENT,
  DocumentType.SUPPORT_EMAIL,
  DocumentType.UNKNOWN,
];
const KNOWN_DOCUMENT_TYPES = CLASSIFICATION_LABELS.filter(
  (label) => label !== DocumentType.UNKNOWN,
);

const DOCUMENT_TYPES = new Set<string>(CLASSIFICATION_LABELS);

@Injectable()
export class AiContextBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async buildDocumentClassificationContext(
    workspaceId: string,
  ): Promise<{
    context: DocumentClassificationContext;
    contextStats: AiContextStats;
  }> {
    const [rules, approvedSuggestions, correctedSuggestions, rejectedSuggestions, validationRuns] =
      await Promise.all([
        this.prisma.operationalRule.findMany({
          where: { workspaceId },
          orderBy: { updatedAt: 'desc' },
          take: 50,
        }),
        this.prisma.aiSuggestion.findMany({
          where: {
            workspaceId,
            mode: 'DOCUMENT_CLASSIFICATION',
            status: AiSuggestionStatus.APPROVED,
          },
          include: { document: true },
          orderBy: { updatedAt: 'desc' },
          take: MAX_APPROVED_EXAMPLES,
        }),
        this.prisma.aiSuggestion.findMany({
          where: {
            workspaceId,
            mode: 'DOCUMENT_CLASSIFICATION',
            status: AiSuggestionStatus.EDITED,
          },
          include: { document: true },
          orderBy: { updatedAt: 'desc' },
          take: MAX_CORRECTED_EXAMPLES,
        }),
        this.prisma.aiSuggestion.findMany({
          where: {
            workspaceId,
            mode: 'DOCUMENT_CLASSIFICATION',
            status: AiSuggestionStatus.REJECTED,
          },
          include: { document: true },
          orderBy: { updatedAt: 'desc' },
          take: MAX_REJECTED_EXAMPLES,
        }),
        this.prisma.validationRun.findMany({
          where: {
            workspaceId,
            mode: 'DOCUMENT_CLASSIFICATION',
            status: 'COMPLETED',
          },
          include: {
            items: {
              include: { document: true },
              orderBy: { updatedAt: 'desc' },
              take: 15,
            },
          },
          orderBy: { completedAt: 'desc' },
          take: 3,
        }),
      ]);

    const validationItems = validationRuns.flatMap((run) => run.items);
    const validationApprovedExamples = validationItems
      .filter((item) => item.status === 'APPROVED')
      .map((item) => this.toValidationExample(item))
      .filter((example): example is DocumentClassificationExample =>
        Boolean(example),
      );
    const validationCorrectedExamples = validationItems
      .filter((item) => item.status === 'EDITED')
      .map((item) => this.toValidationExample(item))
      .filter((example): example is DocumentClassificationExample =>
        Boolean(example),
      );
    const validationRejectedExamples = validationItems
      .filter((item) => item.status === 'REJECTED')
      .map((item) => this.toValidationExample(item))
      .filter((example): example is DocumentClassificationExample =>
        Boolean(example),
      );
    const correctedExamples = [
      ...correctedSuggestions.map((suggestion) =>
        this.toCorrectedSuggestionExample(suggestion),
      ),
      ...validationCorrectedExamples,
    ];
    const rejectedExamples = [
      ...rejectedSuggestions.map((suggestion) =>
        this.toRejectedSuggestionExample(suggestion),
      ),
      ...validationRejectedExamples,
    ];
    const prioritizedRules = this.prioritizeRules(rules);

    const context: DocumentClassificationContext = {
      rules: prioritizedRules.slice(0, MAX_RULES),
      applicabilityRules: prioritizedRules
        .filter(
          (rule) =>
            rule.category === RuleCategory.APPLICABILITY ||
            rule.category === RuleCategory.VALIDATION,
        )
        .slice(0, MAX_RULES),
      approvedExamples: [
        ...approvedSuggestions.map((suggestion) =>
          this.toApprovedSuggestionExample(suggestion),
        ),
        ...validationApprovedExamples,
      ].slice(0, MAX_APPROVED_EXAMPLES),
      correctedExamples: correctedExamples.slice(0, MAX_CORRECTED_EXAMPLES),
      rejectedExamples: rejectedExamples.slice(0, MAX_REJECTED_EXAMPLES),
      unknownExamples: correctedExamples
        .filter((example) => this.isUnknownCorrection(example))
        .slice(0, MAX_UNKNOWN_EXAMPLES),
      rejectionExamples: rejectedExamples
        .filter((example) => this.isKnownLabel(example.predictedLabel))
        .slice(0, MAX_REJECTION_EXAMPLES),
      classificationLabels: CLASSIFICATION_LABELS,
      knownDocumentTypes: KNOWN_DOCUMENT_TYPES,
    };

    return {
      context,
      contextStats: {
        rulesUsed: context.rules.length,
        approvedExamplesUsed: context.approvedExamples.length,
        correctedExamplesUsed: context.correctedExamples.length,
        rejectedExamplesUsed: context.rejectedExamples.length,
        applicabilityRulesUsed: context.applicabilityRules.length,
        unknownExamplesUsed: context.unknownExamples.length,
        rejectionExamplesUsed: context.rejectionExamples.length,
      },
    };
  }

  private prioritizeRules(
    rules: {
      id: string;
      title: string;
      ruleText: string;
      category: string;
      source: string;
      confidence: number;
      updatedAt: Date;
    }[],
  ): DocumentClassificationRuleContext[] {
    const categoryPriority = new Map<string, number>([
      [RuleCategory.APPLICABILITY, 0],
      [RuleCategory.VALIDATION, 1],
    ]);

    return [...rules]
      .sort((left, right) => {
        const leftPriority = categoryPriority.get(left.category) ?? 2;
        const rightPriority = categoryPriority.get(right.category) ?? 2;

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return right.updatedAt.getTime() - left.updatedAt.getTime();
      })
      .map((rule) => ({
        id: rule.id,
        title: rule.title,
        ruleText: rule.ruleText,
        category: rule.category as DocumentClassificationRuleContext['category'],
        source: rule.source as DocumentClassificationRuleContext['source'],
        confidence: rule.confidence,
      }));
  }

  private toApprovedSuggestionExample(
    suggestion: SuggestionWithDocument,
  ): DocumentClassificationExample {
    const documentType = this.toDocumentType(suggestion.selectedText);

    return {
      source: 'AI_SUGGESTION' as const,
      documentId: suggestion.documentId,
      documentName: suggestion.document.originalName,
      documentExcerpt: this.toExcerpt(suggestion.document.extractedText),
      predictedLabel: documentType,
      approvedLabel: documentType,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
      createdAt: suggestion.updatedAt.toISOString(),
    };
  }

  private toCorrectedSuggestionExample(
    suggestion: SuggestionWithDocument,
  ): DocumentClassificationExample {
    return {
      source: 'AI_SUGGESTION' as const,
      documentId: suggestion.documentId,
      documentName: suggestion.document.originalName,
      documentExcerpt: this.toExcerpt(suggestion.document.extractedText),
      predictedLabel: this.toDocumentType(suggestion.selectedText),
      correctedLabel: this.toDocumentType(suggestion.correctedSelectedText),
      reasoning: suggestion.reasoning,
      correctionReasoning: suggestion.correctedReasoning ?? undefined,
      confidence: suggestion.confidence,
      createdAt: suggestion.updatedAt.toISOString(),
    };
  }

  private toRejectedSuggestionExample(
    suggestion: SuggestionWithDocument,
  ): DocumentClassificationExample {
    return {
      source: 'AI_SUGGESTION' as const,
      documentId: suggestion.documentId,
      documentName: suggestion.document.originalName,
      documentExcerpt: this.toExcerpt(suggestion.document.extractedText),
      predictedLabel: this.toDocumentType(suggestion.selectedText),
      rejectedLabel: this.toDocumentType(suggestion.selectedText),
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
      createdAt: suggestion.updatedAt.toISOString(),
    };
  }

  private toValidationExample(
    item: ValidationItemWithDocument,
  ): DocumentClassificationExample | null {
    const predictedLabel = this.toDocumentType(item.predictedLabel);
    const finalLabel = this.toDocumentType(item.finalLabel);
    const expectedLabel = this.toDocumentType(item.expectedLabel);

    if (!predictedLabel && !finalLabel && !expectedLabel) {
      return null;
    }

    return {
      source: 'VALIDATION_RUN' as const,
      documentId: item.documentId ?? undefined,
      documentName: item.document?.originalName,
      documentExcerpt: this.toExcerpt(item.document?.extractedText ?? null),
      predictedLabel,
      correctedLabel: item.status === 'EDITED' ? finalLabel : undefined,
      rejectedLabel: item.status === 'REJECTED' ? predictedLabel : undefined,
      approvedLabel: item.status === 'APPROVED' ? finalLabel || predictedLabel : undefined,
      expectedLabel,
      finalLabel,
      createdAt: item.updatedAt.toISOString(),
    };
  }

  private toDocumentType(value: string | null | undefined): DocumentType | undefined {
    return DOCUMENT_TYPES.has(String(value)) ? (value as DocumentType) : undefined;
  }

  private isUnknownCorrection(example: DocumentClassificationExample): boolean {
    return (
      example.predictedLabel !== DocumentType.UNKNOWN &&
      (example.correctedLabel === DocumentType.UNKNOWN ||
        example.finalLabel === DocumentType.UNKNOWN)
    );
  }

  private isKnownLabel(value: DocumentType | undefined): boolean {
    return Boolean(value && value !== DocumentType.UNKNOWN);
  }

  private toExcerpt(value: string | null): string | undefined {
    const excerpt = value?.trim().slice(0, MAX_EXAMPLE_EXCERPT_CHARS);

    return excerpt || undefined;
  }
}

type SuggestionWithDocument = {
  documentId: string;
  selectedText: string;
  reasoning: string;
  confidence: number;
  correctedSelectedText: string | null;
  correctedReasoning: string | null;
  updatedAt: Date;
  document: {
    originalName: string;
    extractedText: string | null;
  };
};

type ValidationItemWithDocument = {
  documentId: string | null;
  predictedLabel: string | null;
  finalLabel: string | null;
  expectedLabel: string | null;
  status: string;
  updatedAt: Date;
  document: {
    originalName: string;
    extractedText: string | null;
  } | null;
};
