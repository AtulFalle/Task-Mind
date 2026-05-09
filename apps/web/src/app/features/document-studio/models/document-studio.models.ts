import type { Document } from '@task-mind/shared';

export interface UploadDocumentRequest {
  requestId: number;
  workspaceId: string;
  file: File;
}

export type DocumentUploadCompleted = (document: Document) => void;
