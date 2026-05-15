import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DocumentType,
  type DocumentTypeValidationSample,
  type DocumentTypeValidationSamplesResponse,
} from '@task-mind/shared';

interface DocumentTypeSamplesFile {
  samples?: Partial<DocumentTypeValidationSample>[];
}

const DOCUMENT_TYPES = new Set<string>(Object.values(DocumentType));

@Injectable()
export class ValidationSamplesService {
  getDocumentTypeSamples(): DocumentTypeValidationSamplesResponse {
    return {
      samples: this.readDocumentTypeSamples(),
    };
  }

  private readDocumentTypeSamples(): DocumentTypeValidationSample[] {
    const filePath = join(
      process.cwd(),
      'apps',
      'api',
      'src',
      'app',
      'modules',
      'validation-samples',
      'data',
      'document-type-samples.json',
    );
    const parsed = JSON.parse(
      readFileSync(filePath, 'utf8'),
    ) as DocumentTypeSamplesFile;

    return (parsed.samples ?? []).flatMap((sample) => {
      if (
        !sample.id ||
        !sample.title ||
        !sample.text ||
        !sample.expectedType ||
        !DOCUMENT_TYPES.has(sample.expectedType) ||
        !sample.reason
      ) {
        return [];
      }

      return [
        {
          id: sample.id,
          title: sample.title,
          text: sample.text,
          expectedType: sample.expectedType,
          reason: sample.reason,
        },
      ];
    });
  }
}
