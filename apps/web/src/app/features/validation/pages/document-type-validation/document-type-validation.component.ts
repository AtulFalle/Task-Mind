import { Component, computed, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import type { DocumentTypeValidationSample } from '@task-mind/shared';
import { ValidationSamplesService } from '../../services/validation-samples.service';

@Component({
  selector: 'app-document-type-validation',
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './document-type-validation.component.html',
  styleUrl: './document-type-validation.component.scss',
})
export class DocumentTypeValidationComponent {
  private readonly injector = inject(Injector);
  private readonly validationSamplesService = inject(ValidationSamplesService);

  protected readonly samplesResource =
    this.validationSamplesService.getDocumentTypeSamplesResource(this.injector);
  protected readonly samplesResponse = this.samplesResource.value;
  protected readonly samples = computed(() => this.samplesResponse().samples);
  protected readonly copiedSampleId = signal<string | null>(null);
  protected readonly errorMessage = computed(() =>
    this.samplesResource.error()
      ? 'Document type validation samples could not be loaded.'
      : '',
  );
  protected readonly displayedColumns = [
    'title',
    'expectedType',
    'preview',
    'reason',
    'actions',
  ];

  protected textPreview(sample: DocumentTypeValidationSample): string {
    const compactText = sample.text.replace(/\s+/g, ' ').trim();

    return compactText.length > 150
      ? `${compactText.slice(0, 147)}...`
      : compactText;
  }

  protected async copySampleText(
    sample: DocumentTypeValidationSample,
  ): Promise<void> {
    await navigator.clipboard.writeText(sample.text);
    this.copiedSampleId.set(sample.id);

    window.setTimeout(() => {
      if (this.copiedSampleId() === sample.id) {
        this.copiedSampleId.set(null);
      }
    }, 1600);
  }
}
