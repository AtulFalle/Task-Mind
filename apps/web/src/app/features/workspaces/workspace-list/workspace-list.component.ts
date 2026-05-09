import { Component, computed, inject, Injector } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-workspace-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss',
})
export class WorkspaceListComponent {
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
}
