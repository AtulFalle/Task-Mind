import { DatePipe } from '@angular/common';
import { Component, computed, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type {
  Annotation,
  CreateAnnotationRequest,
  UpdateAnnotationRequest,
} from '@task-mind/shared';
import { AnnotationsPanelComponent } from '../../components/annotations-panel/annotations-panel.component';
import { DocumentTextViewerComponent } from '../../components/document-text-viewer/document-text-viewer.component';
import { DocumentStudioService } from '../../services/document-studio.service';

@Component({
  selector: 'app-document-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AnnotationsPanelComponent,
    DocumentTextViewerComponent,
  ],
  templateUrl: './document-detail.component.html',
  styleUrl: './document-detail.component.scss',
})
export class DocumentDetailComponent {
  private readonly documentStudioService = inject(DocumentStudioService);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);

  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly documentId = computed(() =>
    this.route.snapshot.paramMap.get('documentId'),
  );
  protected readonly documentResource =
    this.documentStudioService.getDocumentResource(
      this.documentId,
      this.injector,
    );
  protected readonly documentTextResource =
    this.documentStudioService.getDocumentText(this.documentId, this.injector);
  protected readonly annotationsResource =
    this.documentStudioService.getDocumentAnnotations(
      this.documentId,
      this.injector,
    );
  protected readonly document = this.documentResource.value;
  protected readonly documentText = this.documentTextResource.value;
  protected readonly annotations = this.annotationsResource.value;
  protected readonly isSavingAnnotation = signal(false);
  protected readonly annotationSaveError = signal('');
  protected readonly deletingAnnotationId = signal<string | null>(null);
  protected readonly activeAnnotationId = signal<string | null>(null);
  protected readonly editingAnnotation = signal<Annotation | null>(null);
  protected readonly errorMessage = computed(() => {
    if (!this.documentId()) {
      return 'Document id is missing.';
    }

    return this.documentResource.error() ? 'Document could not be loaded.' : '';
  });
  protected readonly textErrorMessage = computed(() =>
    this.documentTextResource.error() ? 'Document text could not be loaded.' : '',
  );
  protected readonly annotationsErrorMessage = computed(() =>
    this.annotationsResource.error() ? 'Annotations could not be loaded.' : '',
  );

  protected selectAnnotation(annotationId: string): void {
    this.activeAnnotationId.set(annotationId);
    this.annotationSaveError.set('');
  }

  protected async saveAnnotation(
    payload: CreateAnnotationRequest,
  ): Promise<void> {
    const documentId = this.documentId();

    if (!documentId || this.isSavingAnnotation()) {
      return;
    }

    this.isSavingAnnotation.set(true);
    this.annotationSaveError.set('');

    try {
      await this.documentStudioService.createAnnotation(documentId, payload);
      this.annotationsResource.reload();
    } catch {
      this.annotationSaveError.set('Annotation could not be saved.');
    } finally {
      this.isSavingAnnotation.set(false);
    }
  }

  protected async deleteAnnotation(annotationId: string): Promise<void> {
    if (this.deletingAnnotationId()) {
      return;
    }

    this.deletingAnnotationId.set(annotationId);

    try {
      await this.documentStudioService.deleteAnnotation(annotationId);
      if (this.activeAnnotationId() === annotationId) {
        this.activeAnnotationId.set(null);
      }
      if (this.editingAnnotation()?.id === annotationId) {
        this.editingAnnotation.set(null);
      }
      this.annotationsResource.reload();
    } finally {
      this.deletingAnnotationId.set(null);
    }
  }

  protected startEditAnnotation(annotation: Annotation): void {
    this.editingAnnotation.set(annotation);
    this.activeAnnotationId.set(annotation.id);
    this.annotationSaveError.set('');
  }

  protected cancelEditAnnotation(): void {
    this.editingAnnotation.set(null);
    this.annotationSaveError.set('');
  }

  protected async updateAnnotation(update: {
    annotationId: string;
    payload: UpdateAnnotationRequest;
  }): Promise<void> {
    if (this.isSavingAnnotation()) {
      return;
    }

    this.isSavingAnnotation.set(true);
    this.annotationSaveError.set('');

    try {
      await this.documentStudioService.updateAnnotation(
        update.annotationId,
        update.payload,
      );
      this.editingAnnotation.set(null);
      this.annotationsResource.reload();
    } catch {
      this.annotationSaveError.set('Annotation could not be updated.');
    } finally {
      this.isSavingAnnotation.set(false);
    }
  }
}
