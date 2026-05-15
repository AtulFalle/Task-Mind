import { DatePipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ValidationRunMode,
  type CreateValidationRunRequest,
} from '@task-mind/shared';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-validation-runs',
  imports: [
    DatePipe,
    PercentPipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './validation-runs.component.html',
  styleUrl: './validation-runs.component.scss',
})
export class ValidationRunsComponent {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly runsResource = this.workspaceService.getWorkspaceValidationRuns(
    this.workspaceId,
    this.injector,
  );
  protected readonly runs = this.runsResource.value;
  protected readonly draftName = signal('Round 1 - Baseline');
  protected readonly draftDescription = signal(
    'First run before feedback memory improves',
  );
  protected readonly isSaving = signal(false);
  protected readonly saveErrorMessage = signal('');
  protected readonly errorMessage = computed(() =>
    this.runsResource.error() ? 'Validation runs could not be loaded.' : '',
  );
  protected readonly displayedColumns = [
    'name',
    'status',
    'approvalRate',
    'correctionRate',
    'completedAt',
    'actions',
  ];

  protected updateName(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value);
  }

  protected updateDescription(event: Event): void {
    this.draftDescription.set((event.target as HTMLTextAreaElement).value);
  }

  protected async createRun(): Promise<void> {
    const workspaceId = this.workspaceId();
    const name = this.draftName().trim();

    if (!workspaceId || !name || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.saveErrorMessage.set('');

    const payload: CreateValidationRunRequest = {
      name,
      description: this.draftDescription().trim() || undefined,
      mode: ValidationRunMode.DOCUMENT_CLASSIFICATION,
    };

    try {
      await this.workspaceService.createValidationRun(workspaceId, payload);
      this.runsResource.reload();
    } catch {
      this.saveErrorMessage.set('Validation run could not be created.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
