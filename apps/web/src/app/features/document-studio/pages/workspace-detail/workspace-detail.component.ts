import { Component, computed, inject, Injector } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../../workspaces/workspace.service';
import { DocumentListComponent } from '../../components/document-list/document-list.component';
import { DocumentUploadComponent } from '../../components/document-upload/document-upload.component';
import { WorkspaceHeaderComponent } from '../../components/workspace-header/workspace-header.component';
import { DocumentStudioService } from '../../services/document-studio.service';

@Component({
  selector: 'app-document-studio-workspace-detail',
  imports: [
    MatProgressSpinnerModule,
    WorkspaceHeaderComponent,
    DocumentUploadComponent,
    DocumentListComponent,
  ],
  templateUrl: './workspace-detail.component.html',
  styleUrl: './workspace-detail.component.scss',
})
export class WorkspaceDetailComponent {
  private readonly documentStudioService = inject(DocumentStudioService);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly workspaceResource = this.workspaceService.getWorkspaceResource(
    this.workspaceId,
    this.injector,
  );
  protected readonly workspace = this.workspaceResource.value;
  protected readonly workspaceErrorMessage = computed(() => {
    if (!this.workspaceId()) {
      return 'Workspace id is missing.';
    }

    return this.workspaceResource.error() ? 'Workspace could not be loaded.' : '';
  });
  protected readonly documentsResource =
    this.documentStudioService.getWorkspaceDocumentsResource(
      this.workspaceId,
      this.injector,
    );
  protected readonly documents = this.documentsResource.value;
  protected readonly documentsErrorMessage = computed(() =>
    this.documentsResource.error() ? 'Documents could not be loaded.' : '',
  );
  protected readonly handleDocumentUploaded = () => {
    this.documentsResource.reload();
  };
}
