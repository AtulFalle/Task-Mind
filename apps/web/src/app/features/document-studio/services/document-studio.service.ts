import { httpResource } from '@angular/common/http';
import { Injectable, type Injector, type Signal } from '@angular/core';
import type { Document } from '@task-mind/shared';
import type { UploadDocumentRequest } from '../models/document-studio.models';

@Injectable({ providedIn: 'root' })
export class DocumentStudioService {
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
