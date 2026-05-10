import { Component, computed, effect, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { Annotation, CreateAnnotationRequest } from '@task-mind/shared';
import type { SelectedDocumentText } from '../../models/document-studio.models';

@Component({
  selector: 'app-annotation-form',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './annotation-form.component.html',
  styleUrl: './annotation-form.component.scss',
})
export class AnnotationFormComponent {
  readonly selection = input.required<SelectedDocumentText>();
  readonly annotation = input<Annotation | null>(null);
  readonly isSaving = input.required<boolean>();
  readonly errorMessage = input<string>('');
  readonly title = input('Create annotation');
  readonly submitLabel = input('Save annotation');
  readonly saveAnnotation = output<CreateAnnotationRequest>();
  readonly cancelAnnotation = output<void>();

  protected readonly fieldName = signal('');
  protected readonly explanation = signal('');
  protected readonly canSave = computed(
    () => Boolean(this.fieldName().trim()) && !this.isSaving(),
  );

  constructor() {
    effect(() => {
      const annotation = this.annotation();

      this.fieldName.set(annotation?.fieldName ?? '');
      this.explanation.set(annotation?.explanation ?? '');
    });
  }

  protected updateFieldName(event: Event): void {
    this.fieldName.set((event.target as HTMLInputElement).value);
  }

  protected updateExplanation(event: Event): void {
    this.explanation.set((event.target as HTMLTextAreaElement).value);
  }

  protected save(): void {
    const selection = this.selection();
    const fieldName = this.fieldName().trim();

    if (!fieldName || this.isSaving()) {
      return;
    }

    this.saveAnnotation.emit({
      fieldName,
      selectedText: selection.text,
      explanation: this.explanation().trim() || undefined,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
    });
  }
}
