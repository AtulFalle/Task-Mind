import { PercentPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type {
  AiSuggestion,
  UpdateAiSuggestionRequest,
} from '@task-mind/shared';

@Component({
  selector: 'app-ai-suggestions-panel',
  imports: [
    PercentPipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ai-suggestions-panel.component.html',
  styleUrl: './ai-suggestions-panel.component.scss',
})
export class AiSuggestionsPanelComponent {
  readonly suggestions = input.required<AiSuggestion[]>();
  readonly isLoading = input(false);
  readonly errorMessage = input('');
  readonly isRecordingFeedback = input(false);
  readonly askSuggestions = output<void>();
  readonly approveSuggestion = output<string>();
  readonly rejectSuggestion = output<{
    suggestionId: string;
    reason?: string;
  }>();
  readonly convertSuggestion = output<string>();
  readonly editSuggestion = output<{
    suggestionId: string;
    payload: UpdateAiSuggestionRequest;
  }>();

  protected readonly editingSuggestionId = signal<string | null>(null);
  protected readonly rejectingSuggestionId = signal<string | null>(null);
  protected readonly draftFieldName = signal('');
  protected readonly draftSelectedText = signal('');
  protected readonly draftReasoning = signal('');
  protected readonly rejectionReason = signal('');
  protected readonly hasSuggestions = computed(
    () => this.suggestions().length > 0,
  );

  protected displayFieldName(suggestion: AiSuggestion): string {
    return suggestion.correctedFieldName || suggestion.fieldName;
  }

  protected displaySelectedText(suggestion: AiSuggestion): string {
    return suggestion.correctedSelectedText || suggestion.selectedText;
  }

  protected displayReasoning(suggestion: AiSuggestion): string {
    return suggestion.correctedReasoning || suggestion.reasoning;
  }

  protected startEdit(suggestion: AiSuggestion): void {
    this.editingSuggestionId.set(suggestion.id);
    this.rejectingSuggestionId.set(null);
    this.draftFieldName.set(this.displayFieldName(suggestion));
    this.draftSelectedText.set(this.displaySelectedText(suggestion));
    this.draftReasoning.set(this.displayReasoning(suggestion));
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

  protected updateFieldName(event: Event): void {
    this.draftFieldName.set((event.target as HTMLInputElement).value);
  }

  protected updateSelectedText(event: Event): void {
    this.draftSelectedText.set((event.target as HTMLTextAreaElement).value);
  }

  protected updateReasoning(event: Event): void {
    this.draftReasoning.set((event.target as HTMLTextAreaElement).value);
  }

  protected updateRejectionReason(event: Event): void {
    this.rejectionReason.set((event.target as HTMLTextAreaElement).value);
  }

  protected saveEdit(suggestionId: string): void {
    const fieldName = this.draftFieldName().trim();
    const selectedText = this.draftSelectedText().trim();
    const reasoning = this.draftReasoning().trim();

    if (!fieldName || !selectedText || !reasoning) {
      return;
    }

    this.editSuggestion.emit({
      suggestionId,
      payload: {
        correctedFieldName: fieldName,
        correctedSelectedText: selectedText,
        correctedReasoning: reasoning,
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
}
