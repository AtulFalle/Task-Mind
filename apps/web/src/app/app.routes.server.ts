import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'workspaces',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workspaces/:workspaceId/validation',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workspaces/:workspaceId/documents/:documentId',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workspaces/:workspaceId/training-candidates',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workspaces/:workspaceId/validation-runs',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workspaces/:workspaceId/validation-runs/:runId',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workspaces/:workspaceId',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
