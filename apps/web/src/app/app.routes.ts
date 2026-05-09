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
    path: 'workspaces/new',
    loadComponent: () =>
      import(
        './features/workspaces/create-workspace/create-workspace.component'
      ).then(
        (m) => m.CreateWorkspaceComponent,
      ),
  },
  {
    path: 'workspaces/:workspaceId',
    loadComponent: () =>
      import(
        './features/workspaces/workspace-detail/workspace-detail.component'
      ).then(
        (m) => m.WorkspaceDetailComponent,
      ),
  },
];
