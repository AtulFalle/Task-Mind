import { DatePipe } from '@angular/common';
import { Component, computed, inject, Injector } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentStudioService } from '../../services/document-studio.service';

@Component({
  selector: 'app-document-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './document-detail.component.html',
  styleUrl: './document-detail.component.scss',
})
export class DocumentDetailComponent {
  private readonly documentStudioService = inject(DocumentStudioService);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);

  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly documentId = computed(() =>
    this.route.snapshot.paramMap.get('documentId'),
  );
  protected readonly documentResource =
    this.documentStudioService.getDocumentResource(
      this.documentId,
      this.injector,
    );
  protected readonly document = this.documentResource.value;
  protected readonly errorMessage = computed(() => {
    if (!this.documentId()) {
      return 'Document id is missing.';
    }

    return this.documentResource.error() ? 'Document could not be loaded.' : '';
  });
}
