import { PercentPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  DocumentType,
  SuggestionMode,
  type AiContextStats,
  type AiSuggestion,
  type ApplicabilityResult,
  type DocumentTypeClassification,
  type UpdateAiSuggestionRequest,
  type ValidationRun,
} from '@task-mind/shared';

@Component({
  selector: 'app-classification-mode-panel',
  imports: [
    PercentPipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './classification-mode-panel.component.html',
  styleUrl: './classification-mode-panel.component.scss',
})
export class ClassificationModePanelComponent {
  readonly suggestion = input<AiSuggestion | null>(null);
  readonly isLoading = input(false);
  readonly errorMessage = input('');
  readonly isRecordingFeedback = input(false);
  readonly activeValidationRuns = input<ValidationRun[]>([]);
  readonly contextStats = input<AiContextStats | null>(null);
  readonly classifyDocument = output<void>();
  readonly approveSuggestion = output<string>();
  readonly rejectSuggestion = output<{
    suggestionId: string;
    reason?: string;
  }>();
  readonly editSuggestion = output<{
    suggestionId: string;
    payload: UpdateAiSuggestionRequest;
  }>();
  readonly addToValidationRun = output<{
    runId: string;
    expectedLabel: DocumentType;
    suggestion: AiSuggestion;
  }>();

  protected readonly documentTypes = Object.values(DocumentType);
  protected readonly editingSuggestionId = signal<string | null>(null);
  protected readonly rejectingSuggestionId = signal<string | null>(null);
  protected readonly draftDocumentType = signal<DocumentType>(DocumentType.UNKNOWN);
  protected readonly selectedRunId = signal('');
  protected readonly expectedLabel = signal<DocumentType>(DocumentType.UNKNOWN);
  protected readonly draftReasoning = signal('');
  protected readonly rejectionReason = signal('');
  protected readonly classification = computed(() => {
    const suggestion = this.suggestion();

    if (!suggestion || suggestion.mode !== SuggestionMode.DOCUMENT_CLASSIFICATION) {
      return null;
    }

    return this.toClassification(
      suggestion.correctedPayloadJson ?? suggestion.payloadJson,
      suggestion,
    );
  });
  protected readonly contextHint = computed(() => {
    const stats = this.contextStats();

    if (!stats) {
      return '';
    }

    const corrections =
      stats.correctedExamplesUsed + stats.rejectedExamplesUsed;

    return `Using ${stats.rulesUsed} rules and ${corrections} previous corrections.`;
  });
  protected readonly isUnknownClassification = computed(
    () => this.classification()?.documentType === DocumentType.UNKNOWN,
  );

  protected startEdit(suggestion: AiSuggestion): void {
    const classification = this.toClassification(
      suggestion.correctedPayloadJson ?? suggestion.payloadJson,
      suggestion,
    );

    this.editingSuggestionId.set(suggestion.id);
    this.rejectingSuggestionId.set(null);
    this.draftDocumentType.set(classification.documentType);
    this.draftReasoning.set(classification.reasoning);
  }

  protected cancelEdit(): void {
    this.editingSuggestionId.set(null);
  }

  protected startReject(suggestionId: string): void {
    this.rejectingSuggestionId.set(suggestionId);
    this.editingSuggestionId.set(null);
    this.rejectionReason.set('');
  }

  protected cancelReject(): void {
    this.rejectingSuggestionId.set(null);
    this.rejectionReason.set('');
  }

  protected updateDocumentType(value: DocumentType): void {
    this.draftDocumentType.set(value);
  }

  protected updateSelectedRun(runId: string): void {
    this.selectedRunId.set(runId);
  }

  protected updateExpectedLabel(documentType: DocumentType): void {
    this.expectedLabel.set(documentType);
  }

  protected updateReasoning(event: Event): void {
    this.draftReasoning.set((event.target as HTMLTextAreaElement).value);
  }

  protected updateRejectionReason(event: Event): void {
    this.rejectionReason.set((event.target as HTMLTextAreaElement).value);
  }

  protected saveEdit(suggestionId: string): void {
    this.editSuggestion.emit({
      suggestionId,
      payload: {
        correctedDocumentType: this.draftDocumentType(),
        correctedReasoning:
          this.draftReasoning().trim() ||
          'Human corrected the document type classification.',
      },
    });
    this.editingSuggestionId.set(null);
  }

  protected submitReject(suggestionId: string): void {
    this.rejectSuggestion.emit({
      suggestionId,
      reason: this.rejectionReason().trim() || undefined,
    });
    this.cancelReject();
  }

  protected submitValidationRunItem(suggestion: AiSuggestion): void {
    const runId = this.selectedRunId();

    if (!runId) {
      return;
    }

    this.addToValidationRun.emit({
      runId,
      expectedLabel: this.expectedLabel(),
      suggestion,
    });
  }

  private toClassification(
    payload: Record<string, unknown>,
    suggestion: AiSuggestion,
  ): DocumentTypeClassification {
    const payloadType = payload['documentType'];
    const documentType = this.documentTypes.includes(payloadType as DocumentType)
      ? (payloadType as DocumentType)
      : DocumentType.UNKNOWN;
    const reasoning =
      typeof payload['reasoning'] === 'string'
        ? payload['reasoning']
        : suggestion.correctedReasoning || suggestion.reasoning;
    const confidence = Number(payload['confidence']);
    const applicability = this.toApplicability(
      payload['applicability'],
      documentType,
    );

    return {
      documentType,
      reasoning,
      confidence: Number.isNaN(confidence) ? suggestion.confidence : confidence,
      applicability,
    };
  }

  private toApplicability(
    value: unknown,
    documentType: DocumentType,
  ): ApplicabilityResult {
    const fallback: ApplicabilityResult = {
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

  private toStringList(value: unknown): string[] {
    return Array.isArray(value)
      ? value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }
}
