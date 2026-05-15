import { DatePipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-validation-run-detail',
  imports: [
    DatePipe,
    PercentPipe,
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './validation-run-detail.component.html',
  styleUrl: './validation-run-detail.component.scss',
})
export class ValidationRunDetailComponent {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly runId = computed(() =>
    this.route.snapshot.paramMap.get('runId'),
  );
  protected readonly runResource = this.workspaceService.getValidationRunResource(
    this.runId,
    this.injector,
  );
  protected readonly run = this.runResource.value;
  protected readonly isCompleting = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly actionErrorMessage = signal('');
  protected readonly errorMessage = computed(() =>
    this.runResource.error() ? 'Validation run could not be loaded.' : '',
  );
  protected readonly displayedColumns = [
    'expectedLabel',
    'predictedLabel',
    'finalLabel',
    'status',
    'createdAt',
  ];

  protected async completeRun(): Promise<void> {
    const runId = this.runId();

    if (!runId || this.isCompleting()) {
      return;
    }

    this.isCompleting.set(true);
    this.actionErrorMessage.set('');

    try {
      await this.workspaceService.completeValidationRun(runId);
      this.runResource.reload();
    } catch {
      this.actionErrorMessage.set('Validation run could not be completed.');
    } finally {
      this.isCompleting.set(false);
    }
  }

  protected async deleteRun(): Promise<void> {
    const runId = this.runId();
    const workspaceId = this.workspaceId();

    if (!runId || !workspaceId || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.actionErrorMessage.set('');

    try {
      await this.workspaceService.deleteValidationRun(runId);
      await this.router.navigate(['/workspaces', workspaceId, 'validation-runs']);
    } catch {
      this.actionErrorMessage.set('Validation run could not be deleted.');
      this.isDeleting.set(false);
    }
  }
}
