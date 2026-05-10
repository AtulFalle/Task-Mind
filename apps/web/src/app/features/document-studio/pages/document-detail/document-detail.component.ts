import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type {
  Annotation,
  CreateAnnotationRequest,
  LinkedOperationalRule,
  UpdateAnnotationRequest,
} from '@task-mind/shared';
import { TeachingMemoryPanelComponent } from '../../../workspaces/components/teaching-memory-panel/teaching-memory-panel.component';
import { WorkspaceService } from '../../../workspaces/workspace.service';
import { AnnotationDialogComponent } from '../../components/annotation-dialog/annotation-dialog.component';
import { AnnotationsPanelComponent } from '../../components/annotations-panel/annotations-panel.component';
import { DocumentTextViewerComponent } from '../../components/document-text-viewer/document-text-viewer.component';
import type { SelectedDocumentText } from '../../models/document-studio.models';
import { DocumentStudioService } from '../../services/document-studio.service';

@Component({
  selector: 'app-document-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AnnotationsPanelComponent,
    DocumentTextViewerComponent,
    TeachingMemoryPanelComponent,
  ],
  templateUrl: './document-detail.component.html',
  styleUrl: './document-detail.component.scss',
})
export class DocumentDetailComponent {
  private readonly documentStudioService = inject(DocumentStudioService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private linkedRulesLoadId = 0;

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
  protected readonly documentTextResource =
    this.documentStudioService.getDocumentText(this.documentId, this.injector);
  protected readonly annotationsResource =
    this.documentStudioService.getDocumentAnnotations(
      this.documentId,
      this.injector,
    );
  protected readonly feedbackEventsResource =
    this.documentStudioService.getDocumentFeedbackEvents(
      this.documentId,
      this.injector,
    );
  protected readonly workspaceRulesResource = this.workspaceService.getWorkspaceRules(
    this.workspaceId,
    this.injector,
  );
  protected readonly document = this.documentResource.value;
  protected readonly documentText = this.documentTextResource.value;
  protected readonly annotations = this.annotationsResource.value;
  protected readonly feedbackEvents = this.feedbackEventsResource.value;
  protected readonly workspaceRules = this.workspaceRulesResource.value;
  protected readonly isSavingAnnotation = signal(false);
  protected readonly annotationSaveError = signal('');
  protected readonly deletingAnnotationId = signal<string | null>(null);
  protected readonly linkingRuleAnnotationId = signal<string | null>(null);
  protected readonly creatingCandidateAnnotationId = signal<string | null>(null);
  protected readonly linkedRulesByAnnotationId = signal<
    Partial<Record<string, LinkedOperationalRule[]>>
  >({});
  protected readonly activeAnnotationId = signal<string | null>(null);
  protected readonly editingAnnotation = signal<Annotation | null>(null);
  protected readonly errorMessage = computed(() => {
    if (!this.documentId()) {
      return 'Document id is missing.';
    }

    return this.documentResource.error() ? 'Document could not be loaded.' : '';
  });
  protected readonly textErrorMessage = computed(() =>
    this.documentTextResource.error()
      ? 'Document text could not be loaded.'
      : '',
  );
  protected readonly annotationsErrorMessage = computed(() =>
    this.annotationsResource.error() ? 'Annotations could not be loaded.' : '',
  );
  protected readonly feedbackEventsErrorMessage = computed(() =>
    this.feedbackEventsResource.error()
      ? 'Document teaching activity could not be loaded.'
      : '',
  );

  constructor() {
    effect(() => {
      const annotations = this.annotations();

      void this.loadLinkedRules(annotations);
    });
  }

  protected selectAnnotation(annotationId: string): void {
    this.activeAnnotationId.set(annotationId);
    this.annotationSaveError.set('');
  }

  protected handleTextSelected(selection: SelectedDocumentText): void {
    this.editingAnnotation.set(null);
    this.annotationSaveError.set('');

    this.dialog.open(AnnotationDialogComponent, {
      data: {
        selection,
        onSave: (payload: CreateAnnotationRequest) =>
          this.saveAnnotation(payload),
      },
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
  }

  protected async saveAnnotation(
    payload: CreateAnnotationRequest,
  ): Promise<boolean> {
    const documentId = this.documentId();

    if (!documentId || this.isSavingAnnotation()) {
      return false;
    }

    this.isSavingAnnotation.set(true);
    this.annotationSaveError.set('');

    try {
      await this.documentStudioService.createAnnotation(documentId, payload);
      this.annotationsResource.reload();
      this.feedbackEventsResource.reload();
      return true;
    } catch {
      this.annotationSaveError.set('Annotation could not be saved.');
      return false;
    } finally {
      this.isSavingAnnotation.set(false);
    }
  }

  protected async deleteAnnotation(annotationId: string): Promise<void> {
    if (this.deletingAnnotationId()) {
      return;
    }

    this.deletingAnnotationId.set(annotationId);

    try {
      await this.documentStudioService.deleteAnnotation(annotationId);
      if (this.activeAnnotationId() === annotationId) {
        this.activeAnnotationId.set(null);
      }
      if (this.editingAnnotation()?.id === annotationId) {
        this.editingAnnotation.set(null);
      }
      this.linkedRulesByAnnotationId.update((linksByAnnotationId) => {
        const remainingLinks = { ...linksByAnnotationId };
        delete remainingLinks[annotationId];
        return remainingLinks;
      });
      this.annotationsResource.reload();
      this.feedbackEventsResource.reload();
    } finally {
      this.deletingAnnotationId.set(null);
    }
  }

  protected startEditAnnotation(annotation: Annotation): void {
    this.editingAnnotation.set(annotation);
    this.activeAnnotationId.set(annotation.id);
    this.annotationSaveError.set('');
  }

  protected cancelEditAnnotation(): void {
    this.editingAnnotation.set(null);
    this.annotationSaveError.set('');
  }

  protected async updateAnnotation(update: {
    annotationId: string;
    payload: UpdateAnnotationRequest;
  }): Promise<void> {
    if (this.isSavingAnnotation()) {
      return;
    }

    this.isSavingAnnotation.set(true);
    this.annotationSaveError.set('');

    try {
      await this.documentStudioService.updateAnnotation(
        update.annotationId,
        update.payload,
      );
      this.editingAnnotation.set(null);
      this.annotationsResource.reload();
      this.feedbackEventsResource.reload();
    } catch {
      this.annotationSaveError.set('Annotation could not be updated.');
    } finally {
      this.isSavingAnnotation.set(false);
    }
  }

  protected async linkRuleToAnnotation(link: {
    annotationId: string;
    ruleId: string;
  }): Promise<void> {
    if (this.linkingRuleAnnotationId()) {
      return;
    }

    this.linkingRuleAnnotationId.set(link.annotationId);
    this.annotationSaveError.set('');

    try {
      const linkedRule = await this.documentStudioService.linkRuleToAnnotation(
        link.annotationId,
        link.ruleId,
      );
      this.linkedRulesByAnnotationId.update((linksByAnnotationId) => ({
        ...linksByAnnotationId,
        [link.annotationId]: [
          linkedRule,
          ...(linksByAnnotationId[link.annotationId] ?? []),
        ],
      }));
      this.feedbackEventsResource.reload();
    } catch {
      this.annotationSaveError.set('Rule could not be linked.');
    } finally {
      this.linkingRuleAnnotationId.set(null);
    }
  }

  protected async unlinkRuleFromAnnotation(link: {
    annotationId: string;
    ruleId: string;
  }): Promise<void> {
    if (this.linkingRuleAnnotationId()) {
      return;
    }

    this.linkingRuleAnnotationId.set(link.annotationId);
    this.annotationSaveError.set('');

    try {
      await this.documentStudioService.unlinkRuleFromAnnotation(
        link.annotationId,
        link.ruleId,
      );
      this.linkedRulesByAnnotationId.update((linksByAnnotationId) => ({
        ...linksByAnnotationId,
        [link.annotationId]: (linksByAnnotationId[link.annotationId] ?? []).filter(
          (rule) => rule.id !== link.ruleId,
        ),
      }));
      this.feedbackEventsResource.reload();
    } catch {
      this.annotationSaveError.set('Rule could not be unlinked.');
    } finally {
      this.linkingRuleAnnotationId.set(null);
    }
  }

  protected async createTrainingCandidateFromAnnotation(
    annotationId: string,
  ): Promise<void> {
    if (this.creatingCandidateAnnotationId()) {
      return;
    }

    this.creatingCandidateAnnotationId.set(annotationId);
    this.annotationSaveError.set('');

    try {
      await this.documentStudioService.createTrainingCandidateFromAnnotation(
        annotationId,
      );
      this.feedbackEventsResource.reload();
    } catch {
      this.annotationSaveError.set('Training candidate could not be created.');
    } finally {
      this.creatingCandidateAnnotationId.set(null);
    }
  }

  private async loadLinkedRules(annotations: Annotation[]): Promise<void> {
    const requestId = ++this.linkedRulesLoadId;

    if (annotations.length === 0) {
      this.linkedRulesByAnnotationId.set({});
      return;
    }

    try {
      const linkedRuleEntries = await Promise.all(
        annotations.map(async (annotation) => [
          annotation.id,
          await this.documentStudioService.getAnnotationRules(annotation.id),
        ] as const),
      );

      if (requestId === this.linkedRulesLoadId) {
        this.linkedRulesByAnnotationId.set(
          Object.fromEntries(linkedRuleEntries),
        );
      }
    } catch {
      if (requestId === this.linkedRulesLoadId) {
        this.linkedRulesByAnnotationId.set({});
      }
    }
  }
}
