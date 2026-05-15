import { httpResource } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, type Injector } from '@angular/core';
import type { DocumentTypeValidationSamplesResponse } from '@task-mind/shared';

@Injectable({ providedIn: 'root' })
export class ValidationSamplesService {
  private readonly platformId = inject(PLATFORM_ID);

  getDocumentTypeSamplesResource(injector: Injector) {
    return httpResource<DocumentTypeValidationSamplesResponse>(
      () =>
        isPlatformBrowser(this.platformId)
          ? '/api/validation-samples/document-types'
          : undefined,
      {
        defaultValue: { samples: [] },
        injector,
      },
    );
  }
}
