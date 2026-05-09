import { httpResource } from '@angular/common/http';
import { Injectable, type Injector, type Signal } from '@angular/core';
import type { CreateWorkspaceRequest, Workspace } from '@task-mind/shared';

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

  createWorkspaceResource(
    workspaceRequest: Signal<CreateWorkspaceRequest | null>,
    injector: Injector,
  ) {
    return httpResource<Workspace>(
      () => {
        const request = workspaceRequest();

        return request
          ? {
              body: request,
              method: 'POST',
              url: this.apiUrl,
            }
          : undefined;
      },
      { injector },
    );
  }
}
