import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject, type Injector, type Signal } from '@angular/core';
import {
  type Annotation,
  type CreateAnnotationRequest,
  type Document,
  type DocumentTextResponse,
  type UpdateAnnotationRequest,
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

  getDocumentAnnotations(documentId: Signal<string | null>, injector: Injector) {
    return httpResource<Annotation[]>(
      () => {
        const id = documentId();
        return id ? `/api/documents/${id}/annotations` : undefined;
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
      this.httpClient.put<Annotation>(
        `/api/annotations/${annotationId}`,
        payload,
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
