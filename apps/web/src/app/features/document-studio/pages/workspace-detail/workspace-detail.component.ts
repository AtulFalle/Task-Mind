import { Component, computed, inject, Injector, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import type { CreateOperationalRuleRequest } from '@task-mind/shared';
import { OperationalRulesPanelComponent } from '../../../workspaces/components/operational-rules-panel/operational-rules-panel.component';
import { TeachingMemoryPanelComponent } from '../../../workspaces/components/teaching-memory-panel/teaching-memory-panel.component';
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
    OperationalRulesPanelComponent,
    TeachingMemoryPanelComponent,
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
  protected readonly workspaceResource =
    this.workspaceService.getWorkspaceResource(this.workspaceId, this.injector);
  protected readonly workspace = this.workspaceResource.value;
  protected readonly workspaceErrorMessage = computed(() => {
    if (!this.workspaceId()) {
      return 'Workspace id is missing.';
    }

    return this.workspaceResource.error()
      ? 'Workspace could not be loaded.'
      : '';
  });
  protected readonly documentsResource =
    this.documentStudioService.getWorkspaceDocumentsResource(
      this.workspaceId,
      this.injector,
    );
  protected readonly documents = this.documentsResource.value;
  protected readonly rulesResource = this.workspaceService.getWorkspaceRules(
    this.workspaceId,
    this.injector,
  );
  protected readonly rules = this.rulesResource.value;
  protected readonly feedbackEventsResource =
    this.workspaceService.getWorkspaceFeedbackEvents(
      this.workspaceId,
      this.injector,
    );
  protected readonly feedbackEvents = this.feedbackEventsResource.value;
  protected readonly isSavingRule = signal(false);
  protected readonly ruleSaveError = signal('');
  protected readonly deletingRuleId = signal<string | null>(null);
  protected readonly documentsErrorMessage = computed(() =>
    this.documentsResource.error() ? 'Documents could not be loaded.' : '',
  );
  protected readonly rulesErrorMessage = computed(() =>
    this.rulesResource.error() ? 'Operational rules could not be loaded.' : '',
  );
  protected readonly feedbackEventsErrorMessage = computed(() =>
    this.feedbackEventsResource.error()
      ? 'Teaching memory could not be loaded.'
      : '',
  );
  protected readonly handleDocumentUploaded = () => {
    this.documentsResource.reload();
    this.feedbackEventsResource.reload();
  };

  protected async createRule(
    payload: CreateOperationalRuleRequest,
  ): Promise<void> {
    const workspaceId = this.workspaceId();

    if (!workspaceId || this.isSavingRule()) {
      return;
    }

    this.isSavingRule.set(true);
    this.ruleSaveError.set('');

    try {
      await this.workspaceService.createRule(workspaceId, payload);
      this.rulesResource.reload();
      this.feedbackEventsResource.reload();
    } catch {
      this.ruleSaveError.set('Operational rule could not be saved.');
    } finally {
      this.isSavingRule.set(false);
    }
  }

  protected async deleteRule(ruleId: string): Promise<void> {
    if (this.deletingRuleId()) {
      return;
    }

    this.deletingRuleId.set(ruleId);

    try {
      await this.workspaceService.deleteRule(ruleId);
      this.rulesResource.reload();
      this.feedbackEventsResource.reload();
    } finally {
      this.deletingRuleId.set(null);
    }
  }
}
