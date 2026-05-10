import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject, type Injector, type Signal } from '@angular/core';
import type {
  CreateOperationalRuleRequest,
  CreateWorkspaceRequest,
  FeedbackEvent,
  OperationalRule,
  UpdateWorkspaceRequest,
  Workspace,
} from '@task-mind/shared';
import { firstValueFrom } from 'rxjs';

export interface SaveWorkspaceRequest {
  requestId: number;
  workspaceId?: string;
  workspace: CreateWorkspaceRequest | UpdateWorkspaceRequest;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly httpClient = inject(HttpClient);
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

  getWorkspaceRules(workspaceId: Signal<string | null>, injector: Injector) {
    return httpResource<OperationalRule[]>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/rules` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  getWorkspaceFeedbackEvents(
    workspaceId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<FeedbackEvent[]>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/feedback-events` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  createRule(
    workspaceId: string,
    payload: CreateOperationalRuleRequest,
  ): Promise<OperationalRule> {
    return firstValueFrom(
      this.httpClient.post<OperationalRule>(
        `${this.apiUrl}/${workspaceId}/rules`,
        payload,
      ),
    );
  }

  getRule(ruleId: string): Promise<OperationalRule> {
    return firstValueFrom(
      this.httpClient.get<OperationalRule>(`/api/rules/${ruleId}`),
    );
  }

  deleteRule(ruleId: string): Promise<void> {
    return firstValueFrom(this.httpClient.delete<void>(`/api/rules/${ruleId}`));
  }
}
