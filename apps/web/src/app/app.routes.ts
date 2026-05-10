import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'workspaces',
  },
  {
    path: 'workspaces',
    loadComponent: () =>
      import(
        './features/workspaces/workspace-list/workspace-list.component'
      ).then(
        (m) => m.WorkspaceListComponent,
      ),
  },
  {
    path: 'workspaces/:workspaceId/documents/:documentId',
    loadComponent: () =>
      import(
        './features/document-studio/pages/document-detail/document-detail.component'
      ).then((m) => m.DocumentDetailComponent),
  },
  {
    path: 'workspaces/:workspaceId/training-candidates',
    loadComponent: () =>
      import(
        './features/workspaces/training-candidates/training-candidates.component'
      ).then((m) => m.TrainingCandidatesComponent),
  },
  {
    path: 'workspaces/:workspaceId',
    loadComponent: () =>
      import(
        './features/document-studio/pages/workspace-detail/workspace-detail.component'
      ).then((m) => m.WorkspaceDetailComponent),
  },
];
