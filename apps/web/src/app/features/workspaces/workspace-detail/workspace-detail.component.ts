import { Component, computed, inject, Injector } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-workspace-detail',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './workspace-detail.component.html',
  styleUrl: './workspace-detail.component.scss',
})
export class WorkspaceDetailComponent {
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
  protected readonly isLoading = this.workspaceResource.isLoading;
  protected readonly errorMessage = computed(() => {
    if (!this.workspaceId()) {
      return 'Workspace id is missing.';
    }

    return this.workspaceResource.error() ? 'Workspace could not be loaded.' : '';
  });
  protected readonly createdDate = computed(() => {
    const workspace = this.workspace();
    return workspace ? new Date(workspace.createdAt).toLocaleString() : '';
  });
}
