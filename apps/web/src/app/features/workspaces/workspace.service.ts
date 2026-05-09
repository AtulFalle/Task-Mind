import { httpResource } from '@angular/common/http';
import { Injectable, type Injector, type Signal } from '@angular/core';
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  Workspace,
} from '@task-mind/shared';

export interface SaveWorkspaceRequest {
  requestId: number;
  workspaceId?: string;
  workspace: CreateWorkspaceRequest | UpdateWorkspaceRequest;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly apiUrl = '/api/workspaces';

  getWorkspacesResource(injector: Injector) {
    return httpResource<Workspace[]>(() => this.apiUrl, {
      defaultValue: [],
      injector,
    });
  }

  getWorkspaceResource(workspaceId: Signal<string | null>, injector: Injector) {
    return httpResource<Workspace>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}` : undefined;
      },
      { injector },
    );
  }

  saveWorkspaceResource(
    workspaceRequest: Signal<SaveWorkspaceRequest | null>,
    injector: Injector,
  ) {
    return httpResource<Workspace>(
      () => {
        const saveRequest = workspaceRequest();

        return saveRequest
          ? {
              body: saveRequest.workspace,
              method: saveRequest.workspaceId ? 'PUT' : 'POST',
              url: saveRequest.workspaceId
                ? `${this.apiUrl}/${saveRequest.workspaceId}`
                : this.apiUrl,
            }
          : undefined;
      },
      { injector },
    );
  }
}
