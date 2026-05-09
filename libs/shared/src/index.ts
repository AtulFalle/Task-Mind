export const StudioType = {
  DOCUMENT: 'DOCUMENT',
} as const;

export type StudioType = (typeof StudioType)[keyof typeof StudioType];

export const DocumentStatus = {
  UPLOADED: 'UPLOADED',
  PARSING_PENDING: 'PARSING_PENDING',
  PARSED: 'PARSED',
  FAILED: 'FAILED',
} as const;

export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  studioType: StudioType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  studioType: StudioType;
}

export type UpdateWorkspaceRequest = CreateWorkspaceRequest;

export interface Document {
  id: string;
  workspaceId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  filePath: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}
