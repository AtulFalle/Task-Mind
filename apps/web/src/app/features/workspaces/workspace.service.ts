import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { CreateWorkspaceRequest, Workspace } from '@task-mind/shared';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/workspaces';

  createWorkspace(workspace: CreateWorkspaceRequest) {
    return this.http.post<Workspace>(this.apiUrl, workspace);
  }

  getWorkspaces() {
    return this.http.get<Workspace[]>(this.apiUrl);
  }

  getWorkspace(workspaceId: string) {
    return this.http.get<Workspace>(`${this.apiUrl}/${workspaceId}`);
  }
}
