import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import type { CreateAnnotationRequest } from '@task-mind/shared';
import type { SelectedDocumentText } from '../../models/document-studio.models';
import { AnnotationFormComponent } from '../annotation-form/annotation-form.component';

export interface AnnotationDialogData {
  selection: SelectedDocumentText;
  onSave: (payload: CreateAnnotationRequest) => Promise<boolean>;
}

@Component({
  selector: 'app-annotation-dialog',
  imports: [MatDialogModule, AnnotationFormComponent],
  templateUrl: './annotation-dialog.component.html',
  styleUrl: './annotation-dialog.component.scss',
})
export class AnnotationDialogComponent {
  protected readonly data = inject<AnnotationDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AnnotationDialogComponent>);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected async saveAnnotation(
    payload: CreateAnnotationRequest,
  ): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const didSave = await this.data.onSave(payload);

    if (didSave) {
      this.dialogRef.close();
      return;
    }

    this.errorMessage.set('Annotation could not be saved.');
    this.isSaving.set(false);
  }

  protected cancelAnnotation(): void {
    this.dialogRef.close();
  }
}
