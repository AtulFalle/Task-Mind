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
    path: 'validation/document-types',
    loadComponent: () =>
      import(
        './features/validation/pages/document-type-validation/document-type-validation.component'
      ).then((m) => m.DocumentTypeValidationComponent),
  },
  {
    path: 'workspaces/:workspaceId/validation',
    loadComponent: () =>
      import(
        './features/validation/pages/validation-flow/validation-flow.component'
      ).then((m) => m.ValidationFlowComponent),
  },
  {
    path: 'workspaces/:workspaceId/playground',
    loadComponent: () =>
      import(
        './features/workspaces/learning-playground/learning-playground.component'
      ).then((m) => m.LearningPlaygroundComponent),
  },
  {
    path: 'workspaces/:workspaceId/documents/:documentId',
    loadComponent: () =>
      import(
        './features/document-studio/pages/document-detail/document-detail.component'
      ).then((m) => m.DocumentDetailComponent),
  },
  {
    path: 'workspaces/:workspaceId/validation-runs',
    loadComponent: () =>
      import(
        './features/workspaces/validation-runs/validation-runs.component'
      ).then((m) => m.ValidationRunsComponent),
  },
  {
    path: 'workspaces/:workspaceId/validation-runs/:runId',
    loadComponent: () =>
      import(
        './features/workspaces/validation-run-detail/validation-run-detail.component'
      ).then((m) => m.ValidationRunDetailComponent),
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
