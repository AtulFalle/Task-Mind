import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'workspaces',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workspaces/:workspaceId/documents/:documentId',
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
