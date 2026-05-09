import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  StudioType,
  type CreateWorkspaceRequest,
  type Workspace,
} from '@task-mind/shared';
import {
  type SaveWorkspaceRequest,
  WorkspaceService,
} from '../workspace.service';

export interface WorkspaceDialogData {
  workspace?: Workspace;
  onSaved: (workspace: Workspace) => void;
}

@Component({
  selector: 'app-workspace-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './workspace-dialog.component.html',
  styleUrl: './workspace-dialog.component.scss',
})
export class WorkspaceDialogComponent {
  private saveRequestId = 0;
  private readonly data = inject<WorkspaceDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<WorkspaceDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly injector = inject(Injector);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly studioTypes = [StudioType.DOCUMENT];
  protected readonly dialogTitle = this.data.workspace
    ? 'Edit workspace'
    : 'Create workspace';
  protected readonly submitLabel = this.data.workspace ? 'Save' : 'Create';
  protected readonly workspaceRequest = signal<SaveWorkspaceRequest | null>(null);
  protected readonly createWorkspaceResource =
    this.workspaceService.saveWorkspaceResource(
      this.workspaceRequest,
      this.injector,
    );
  protected readonly isSaving = this.createWorkspaceResource.isLoading;
  protected readonly errorMessage = computed(() =>
    this.createWorkspaceResource.error()
      ? 'Workspace could not be created.'
      : '',
  );

  protected readonly workspaceForm = this.formBuilder.nonNullable.group({
    name: [this.data.workspace?.name ?? '', Validators.required],
    description: [this.data.workspace?.description ?? ''],
    studioType: [
      this.data.workspace?.studioType ?? StudioType.DOCUMENT,
      Validators.required,
    ],
  });

  constructor() {
    effect(() => {
      const savedWorkspace = this.createWorkspaceResource.value();

      if (savedWorkspace) {
        this.data.onSaved(savedWorkspace);
        this.dialogRef.close(savedWorkspace);
      }
    });
  }

  protected saveWorkspace(): void {
    if (this.workspaceForm.invalid) {
      this.workspaceForm.markAllAsTouched();
      return;
    }

    this.workspaceRequest.set({
      requestId: this.saveRequestId++,
      workspaceId: this.data.workspace?.id,
      workspace: this.workspaceForm.getRawValue() as CreateWorkspaceRequest,
    });
  }
}
