import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject, type Injector, type Signal } from '@angular/core';
import type {
  CreateOperationalRuleRequest,
  PlaygroundClassificationRequest,
  PlaygroundClassificationResponse,
  PlaygroundCorrectionRequest,
  PlaygroundExample,
  PlaygroundMetrics,
  CreateTrainingCandidateRequest,
  CreateValidationRunRequest,
  CreateWorkspaceRequest,
  FeedbackEvent,
  OperationalRule,
  TrainingCandidate,
  UpdateTrainingCandidateRequest,
  UpdateWorkspaceRequest,
  ValidationRun,
  ValidationRunItem,
  Workspace,
  WorkspaceValidationMetrics,
  WorkspaceValidationReadiness,
} from '@task-mind/shared';
import type { AddValidationRunItemRequest } from '@task-mind/shared';
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

  getWorkspaceTrainingCandidates(
    workspaceId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<TrainingCandidate[]>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/training-candidates` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  getWorkspaceValidationMetricsResource(
    workspaceId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<WorkspaceValidationMetrics>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/validation-metrics` : undefined;
      },
      { injector },
    );
  }

  getWorkspaceValidationMetrics(
    workspaceId: string,
  ): Promise<WorkspaceValidationMetrics> {
    return firstValueFrom(
      this.httpClient.get<WorkspaceValidationMetrics>(
        `${this.apiUrl}/${workspaceId}/validation-metrics`,
      ),
    );
  }

  getWorkspaceValidationReadinessResource(
    workspaceId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<WorkspaceValidationReadiness>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/validation-readiness` : undefined;
      },
      { injector },
    );
  }

  getPlaygroundExamples(workspaceId: Signal<string | null>, injector: Injector) {
    return httpResource<PlaygroundExample[]>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/playground/examples` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  getPlaygroundMetrics(workspaceId: Signal<string | null>, injector: Injector) {
    return httpResource<PlaygroundMetrics>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/playground/metrics` : undefined;
      },
      { injector },
    );
  }

  classifyPlaygroundMessage(
    workspaceId: string,
    payload: PlaygroundClassificationRequest,
  ): Promise<PlaygroundClassificationResponse> {
    return firstValueFrom(
      this.httpClient.post<PlaygroundClassificationResponse>(
        `${this.apiUrl}/${workspaceId}/playground/classify`,
        payload,
      ),
    );
  }

  approvePlaygroundExample(exampleId: string): Promise<PlaygroundExample> {
    return firstValueFrom(
      this.httpClient.patch<PlaygroundExample>(
        `/api/playground/examples/${exampleId}/approve`,
        {},
      ),
    );
  }

  correctPlaygroundExample(
    exampleId: string,
    payload: PlaygroundCorrectionRequest,
  ): Promise<PlaygroundExample> {
    return firstValueFrom(
      this.httpClient.patch<PlaygroundExample>(
        `/api/playground/examples/${exampleId}/correct`,
        payload,
      ),
    );
  }

  getWorkspaceValidationRuns(
    workspaceId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<ValidationRun[]>(
      () => {
        const id = workspaceId();
        return id ? `${this.apiUrl}/${id}/validation-runs` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  getValidationRunResource(runId: Signal<string | null>, injector: Injector) {
    return httpResource<ValidationRun>(
      () => {
        const id = runId();
        return id ? `/api/validation-runs/${id}` : undefined;
      },
      { injector },
    );
  }

  createValidationRun(
    workspaceId: string,
    payload: CreateValidationRunRequest,
  ): Promise<ValidationRun> {
    return firstValueFrom(
      this.httpClient.post<ValidationRun>(
        `${this.apiUrl}/${workspaceId}/validation-runs`,
        payload,
      ),
    );
  }

  completeValidationRun(runId: string): Promise<ValidationRun> {
    return firstValueFrom(
      this.httpClient.patch<ValidationRun>(
        `/api/validation-runs/${runId}/complete`,
        {},
      ),
    );
  }

  deleteValidationRun(runId: string): Promise<void> {
    return firstValueFrom(
      this.httpClient.delete<void>(`/api/validation-runs/${runId}`),
    );
  }

  addValidationRunItem(
    runId: string,
    payload: AddValidationRunItemRequest,
  ): Promise<ValidationRunItem> {
    return firstValueFrom(
      this.httpClient.post<ValidationRunItem>(
        `/api/validation-runs/${runId}/items`,
        payload,
      ),
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

  createTrainingCandidate(
    workspaceId: string,
    payload: CreateTrainingCandidateRequest,
  ): Promise<TrainingCandidate> {
    return firstValueFrom(
      this.httpClient.post<TrainingCandidate>(
        `${this.apiUrl}/${workspaceId}/training-candidates`,
        payload,
      ),
    );
  }

  getTrainingCandidate(candidateId: string): Promise<TrainingCandidate> {
    return firstValueFrom(
      this.httpClient.get<TrainingCandidate>(
        `/api/training-candidates/${candidateId}`,
      ),
    );
  }

  updateTrainingCandidate(
    candidateId: string,
    payload: UpdateTrainingCandidateRequest,
  ): Promise<TrainingCandidate> {
    return firstValueFrom(
      this.httpClient.patch<TrainingCandidate>(
        `/api/training-candidates/${candidateId}`,
        payload,
      ),
    );
  }

  deleteTrainingCandidate(candidateId: string): Promise<void> {
    return firstValueFrom(
      this.httpClient.delete<void>(`/api/training-candidates/${candidateId}`),
    );
  }
}
