import { Component, input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Annotation, CreateAnnotationRequest } from '@task-mind/shared';
import { AnnotationFormComponent } from '../annotation-form/annotation-form.component';
import { AnnotationCardComponent } from '../annotation-card/annotation-card.component';

@Component({
  selector: 'app-annotations-panel',
  imports: [
    MatProgressSpinnerModule,
    AnnotationCardComponent,
    AnnotationFormComponent,
  ],
  templateUrl: './annotations-panel.component.html',
  styleUrl: './annotations-panel.component.scss',
})
export class AnnotationsPanelComponent {
  readonly annotations = input.required<Annotation[]>();
  readonly isLoading = input.required<boolean>();
  readonly errorMessage = input<string>('');
  readonly deletingAnnotationId = input<string | null>(null);
  readonly activeAnnotationId = input<string | null>(null);
  readonly editingAnnotation = input<Annotation | null>(null);
  readonly isSavingAnnotation = input(false);
  readonly saveErrorMessage = input('');
  readonly deleteAnnotation = output<string>();
  readonly editAnnotation = output<Annotation>();
  readonly updateAnnotation = output<{
    annotationId: string;
    payload: CreateAnnotationRequest;
  }>();
  readonly cancelEdit = output<void>();
  readonly selectAnnotation = output<string>();
}
