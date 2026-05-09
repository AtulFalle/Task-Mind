import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { DocumentUploadCompleted } from '../../models/document-studio.models';
import { DocumentStudioService } from '../../services/document-studio.service';

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt']);

@Component({
  selector: 'app-document-upload',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss',
})
export class DocumentUploadComponent {
  private uploadRequestId = 0;
  private readonly documentStudioService = inject(DocumentStudioService);
  private readonly injector = inject(Injector);

  readonly workspaceId = input.required<string>();
  readonly onUploaded = input.required<DocumentUploadCompleted>();

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly clientErrorMessage = signal('');
  protected readonly uploadRequest = signal<{
    requestId: number;
    workspaceId: string;
    file: File;
  } | null>(null);
  protected readonly uploadResource =
    this.documentStudioService.uploadDocumentResource(
      this.uploadRequest,
      this.injector,
    );
  protected readonly isUploading = this.uploadResource.isLoading;
  protected readonly uploadProgress = computed(() => {
    const progress = this.uploadResource.progress();

    if (!progress?.total) {
      return this.isUploading() ? 35 : 0;
    }

    return Math.round((progress.loaded / progress.total) * 100);
  });
  protected readonly uploadErrorMessage = computed(() => {
    if (this.clientErrorMessage()) {
      return this.clientErrorMessage();
    }

    return this.uploadResource.error() ? 'Document upload failed.' : '';
  });

  constructor() {
    effect(() => {
      const uploadedDocument = this.uploadResource.value();

      if (uploadedDocument) {
        this.onUploaded()(uploadedDocument);
        this.selectedFile.set(null);
      }
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectFile(input.files?.item(0) ?? null);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.selectFile(event.dataTransfer?.files.item(0) ?? null);
  }

  protected uploadSelectedFile(): void {
    const file = this.selectedFile();

    if (!file) {
      this.clientErrorMessage.set('Choose a document before uploading.');
      return;
    }

    this.uploadRequest.set({
      requestId: this.uploadRequestId++,
      workspaceId: this.workspaceId(),
      file,
    });
  }

  private selectFile(file: File | null): void {
    this.clientErrorMessage.set('');

    if (!file) {
      this.selectedFile.set(null);
      return;
    }

    if (!this.isAllowedFile(file)) {
      this.selectedFile.set(null);
      this.clientErrorMessage.set('Upload PDF, DOCX, or TXT files only.');
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      this.selectedFile.set(null);
      this.clientErrorMessage.set('Document size must be 10MB or less.');
      return;
    }

    this.selectedFile.set(file);
  }

  private isAllowedFile(file: File): boolean {
    const extension = file.name
      .slice(file.name.lastIndexOf('.'))
      .toLowerCase();

    return ALLOWED_MIME_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension);
  }
}
