import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Workspace } from '@task-mind/shared';
import { WorkspaceService } from './workspace.service';

@Component({
  selector: 'app-workspace-detail-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './workspace-detail.page.html',
  styleUrl: './workspace-detail.page.scss',
})
export class WorkspaceDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspace = signal<Workspace | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly createdDate = computed(() => {
    const workspace = this.workspace();
    return workspace ? new Date(workspace.createdAt).toLocaleString() : '';
  });

  constructor() {
    const workspaceId = this.route.snapshot.paramMap.get('workspaceId');

    if (!workspaceId) {
      this.errorMessage.set('Workspace id is missing.');
      this.isLoading.set(false);
      return;
    }

    this.workspaceService.getWorkspace(workspaceId).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Workspace could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }
}
