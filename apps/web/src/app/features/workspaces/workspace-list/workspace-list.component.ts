import { DatePipe } from '@angular/common';
import { Component, computed, inject, Injector } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import type { Workspace } from '@task-mind/shared';
import { WorkspaceService } from '../workspace.service';
import { WorkspaceDialogComponent } from '../workspace-dialog/workspace-dialog.component';

@Component({
  selector: 'app-workspace-list',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss',
})
export class WorkspaceListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspacesResource =
    this.workspaceService.getWorkspacesResource(this.injector);
  protected readonly workspaces = this.workspacesResource.value;
  protected readonly isLoading = this.workspacesResource.isLoading;
  protected readonly errorMessage = computed(() =>
    this.workspacesResource.error() ? 'Workspaces could not be loaded.' : '',
  );
  protected readonly hasWorkspaces = computed(
    () => this.workspaces().length > 0,
  );
  protected readonly displayedColumns = [
    'name',
    'studioType',
    'updatedAt',
    'actions',
  ];

  protected openCreateWorkspaceDialog(): void {
    this.dialog.open(WorkspaceDialogComponent, {
      data: {
        onSaved: () => this.workspacesResource.reload(),
      },
      width: '36rem',
    });
  }

  protected openEditWorkspaceDialog(workspace: Workspace): void {
    this.dialog.open(WorkspaceDialogComponent, {
      data: {
        workspace,
        onSaved: () => this.workspacesResource.reload(),
      },
      width: '36rem',
    });
  }
}
