import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject, type Injector, type Signal } from '@angular/core';
import {
  type AiAnnotationSuggestionsResponse,
  type AiSuggestion,
  type Annotation,
  type CreateAnnotationRequest,
  type Document,
  type DocumentTextResponse,
  type FeedbackEvent,
  type LinkedOperationalRule,
  type RejectAiSuggestionRequest,
  type TrainingCandidate,
  type UpdateAnnotationRequest,
  type UpdateAiSuggestionRequest,
} from '@task-mind/shared';
import { firstValueFrom } from 'rxjs';
import type { UploadDocumentRequest } from '../models/document-studio.models';

@Injectable({ providedIn: 'root' })
export class DocumentStudioService {
  private readonly httpClient = inject(HttpClient);

  getWorkspaceDocumentsResource(
    workspaceId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<Document[]>(
      () => {
        const id = workspaceId();
        return id ? `/api/workspaces/${id}/documents` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  getDocumentResource(documentId: Signal<string | null>, injector: Injector) {
    return httpResource<Document>(
      () => {
        const id = documentId();
        return id ? `/api/documents/${id}` : undefined;
      },
      { injector },
    );
  }

  getDocumentText(documentId: Signal<string | null>, injector: Injector) {
    return httpResource<DocumentTextResponse>(
      () => {
        const id = documentId();
        return id ? `/api/documents/${id}/text` : undefined;
      },
      { injector },
    );
  }

  getDocumentAnnotations(
    documentId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<Annotation[]>(
      () => {
        const id = documentId();
        return id ? `/api/documents/${id}/annotations` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  getDocumentFeedbackEvents(
    documentId: Signal<string | null>,
    injector: Injector,
  ) {
    return httpResource<FeedbackEvent[]>(
      () => {
        const id = documentId();
        return id ? `/api/documents/${id}/feedback-events` : undefined;
      },
      { defaultValue: [], injector },
    );
  }

  createAnnotation(
    documentId: string,
    payload: CreateAnnotationRequest,
  ): Promise<Annotation> {
    return firstValueFrom(
      this.httpClient.post<Annotation>(
        `/api/documents/${documentId}/annotations`,
        payload,
      ),
    );
  }

  getAiSuggestions(
    documentId: string,
  ): Promise<AiAnnotationSuggestionsResponse> {
    return firstValueFrom(
      this.httpClient.post<AiAnnotationSuggestionsResponse>(
        `/api/documents/${documentId}/ai-suggestions`,
        {},
      ),
    );
  }

  getDocumentAiSuggestions(documentId: string): Promise<AiSuggestion[]> {
    return firstValueFrom(
      this.httpClient.get<AiSuggestion[]>(
        `/api/documents/${documentId}/ai-suggestions`,
      ),
    );
  }

  approveAiSuggestion(suggestionId: string): Promise<AiSuggestion> {
    return firstValueFrom(
      this.httpClient.patch<AiSuggestion>(
        `/api/ai-suggestions/${suggestionId}/approve`,
        {},
      ),
    );
  }

  rejectAiSuggestion(
    suggestionId: string,
    reason?: string,
  ): Promise<AiSuggestion> {
    const payload: RejectAiSuggestionRequest = { reason };

    return firstValueFrom(
      this.httpClient.patch<AiSuggestion>(
        `/api/ai-suggestions/${suggestionId}/reject`,
        payload,
      ),
    );
  }

  editAiSuggestion(
    suggestionId: string,
    payload: UpdateAiSuggestionRequest,
  ): Promise<AiSuggestion> {
    return firstValueFrom(
      this.httpClient.patch<AiSuggestion>(
        `/api/ai-suggestions/${suggestionId}/edit`,
        payload,
      ),
    );
  }

  convertAiSuggestionToAnnotation(suggestionId: string): Promise<AiSuggestion> {
    return firstValueFrom(
      this.httpClient.post<AiSuggestion>(
        `/api/ai-suggestions/${suggestionId}/convert-to-annotation`,
        {},
      ),
    );
  }

  deleteAnnotation(annotationId: string): Promise<void> {
    return firstValueFrom(
      this.httpClient.delete<void>(`/api/annotations/${annotationId}`),
    );
  }

  updateAnnotation(
    annotationId: string,
    payload: UpdateAnnotationRequest,
  ): Promise<Annotation> {
    return firstValueFrom(
      this.httpClient.patch<Annotation>(
        `/api/annotations/${annotationId}`,
        payload,
      ),
    );
  }

  linkRuleToAnnotation(
    annotationId: string,
    ruleId: string,
  ): Promise<LinkedOperationalRule> {
    return firstValueFrom(
      this.httpClient.post<LinkedOperationalRule>(
        `/api/annotations/${annotationId}/rules/${ruleId}`,
        {},
      ),
    );
  }

  unlinkRuleFromAnnotation(
    annotationId: string,
    ruleId: string,
  ): Promise<void> {
    return firstValueFrom(
      this.httpClient.delete<void>(
        `/api/annotations/${annotationId}/rules/${ruleId}`,
      ),
    );
  }

  getAnnotationRules(annotationId: string): Promise<LinkedOperationalRule[]> {
    return firstValueFrom(
      this.httpClient.get<LinkedOperationalRule[]>(
        `/api/annotations/${annotationId}/rules`,
      ),
    );
  }

  createTrainingCandidateFromAnnotation(
    annotationId: string,
  ): Promise<TrainingCandidate> {
    return firstValueFrom(
      this.httpClient.post<TrainingCandidate>(
        `/api/annotations/${annotationId}/training-candidate`,
        {},
      ),
    );
  }

  uploadDocumentResource(
    uploadRequest: Signal<UploadDocumentRequest | null>,
    injector: Injector,
  ) {
    return httpResource<Document>(
      () => {
        const request = uploadRequest();

        if (!request) {
          return undefined;
        }

        const formData = new FormData();
        formData.append('file', request.file);

        return {
          body: formData,
          method: 'POST',
          reportProgress: true,
          url: `/api/workspaces/${request.workspaceId}/documents/upload`,
        };
      },
      { injector },
    );
  }
}
