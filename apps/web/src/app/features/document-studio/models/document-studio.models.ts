import type { Document } from '@task-mind/shared';

export interface UploadDocumentRequest {
  requestId: number;
  workspaceId: string;
  file: File;
}

export type DocumentUploadCompleted = (document: Document) => void;

export interface SelectedDocumentText {
  text: string;
  startOffset?: number;
  endOffset?: number;
}

export interface AnnotationTextSegment {
  id: string;
  text: string;
  annotationId?: string;
}

export interface AnnotationPopoverPosition {
  left: number;
  top: number;
}
