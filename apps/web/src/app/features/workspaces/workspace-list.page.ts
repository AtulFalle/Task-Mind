import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Workspace } from '@task-mind/shared';
import { WorkspaceService } from './workspace.service';

@Component({
  selector: 'app-workspace-list-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './workspace-list.page.html',
  styleUrl: './workspace-list.page.scss',
})
export class WorkspaceListPage {
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspaces = signal<Workspace[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly hasWorkspaces = computed(
    () => this.workspaces().length > 0,
  );

  constructor() {
    this.workspaceService.getWorkspaces().subscribe({
      next: (workspaces) => {
        this.workspaces.set(workspaces);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Workspaces could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }
}
