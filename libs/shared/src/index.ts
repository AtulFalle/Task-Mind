export const StudioType = {
  DOCUMENT: 'DOCUMENT',
} as const;

export type StudioType = (typeof StudioType)[keyof typeof StudioType];

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
