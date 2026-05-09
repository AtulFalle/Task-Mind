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
      import('./features/workspaces/workspace-list.page').then(
        (m) => m.WorkspaceListPage,
      ),
  },
  {
    path: 'workspaces/new',
    loadComponent: () =>
      import('./features/workspaces/create-workspace.page').then(
        (m) => m.CreateWorkspacePage,
      ),
  },
  {
    path: 'workspaces/:workspaceId',
    loadComponent: () =>
      import('./features/workspaces/workspace-detail.page').then(
        (m) => m.WorkspaceDetailPage,
      ),
  },
];
