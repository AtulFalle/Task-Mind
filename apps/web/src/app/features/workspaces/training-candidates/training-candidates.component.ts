import { DatePipe } from '@angular/common';
import { Component, computed, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  TrainingCandidateStatus,
  type TrainingCandidate,
  type UpdateTrainingCandidateRequest,
} from '@task-mind/shared';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-training-candidates',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './training-candidates.component.html',
  styleUrl: './training-candidates.component.scss',
})
export class TrainingCandidatesComponent {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly workspaceResource =
    this.workspaceService.getWorkspaceResource(this.workspaceId, this.injector);
  protected readonly candidatesResource =
    this.workspaceService.getWorkspaceTrainingCandidates(
      this.workspaceId,
      this.injector,
    );
  protected readonly workspace = this.workspaceResource.value;
  protected readonly candidates = this.candidatesResource.value;
  protected readonly displayedColumns = [
    'type',
    'status',
    'instruction',
    'expectedOutput',
    'reasoning',
    'source',
    'actions',
  ];
  protected readonly editingCandidateId = signal<string | null>(null);
  protected readonly savingCandidateId = signal<string | null>(null);
  protected readonly instruction = signal('');
  protected readonly expectedOutputText = signal('');
  protected readonly reasoning = signal('');
  protected readonly saveErrorMessage = signal('');
  protected readonly pageErrorMessage = computed(() => {
    if (!this.workspaceId()) {
      return 'Workspace id is missing.';
    }

    return this.workspaceResource.error() || this.candidatesResource.error()
      ? 'Training candidates could not be loaded.'
      : '';
  });
  protected readonly editingCandidate = computed(() => {
    const editingCandidateId = this.editingCandidateId();

    return (
      this.candidates().find(
        (candidate) => candidate.id === editingCandidateId,
      ) ?? null
    );
  });

  protected startEdit(candidate: TrainingCandidate): void {
    this.editingCandidateId.set(candidate.id);
    this.instruction.set(candidate.instruction);
    this.expectedOutputText.set(
      JSON.stringify(candidate.expectedOutput, null, 2),
    );
    this.reasoning.set(candidate.reasoning ?? '');
    this.saveErrorMessage.set('');
  }

  protected cancelEdit(): void {
    this.editingCandidateId.set(null);
    this.saveErrorMessage.set('');
  }

  protected async saveCandidate(candidateId: string): Promise<void> {
    const parsedOutput = this.parseExpectedOutput();
    const candidate = this.editingCandidate();

    if (!parsedOutput || !candidate) {
      return;
    }

    await this.updateCandidate(candidateId, {
      instruction: this.instruction(),
      expectedOutput: parsedOutput,
      reasoning: this.reasoning(),
      status:
        candidate.status === TrainingCandidateStatus.DRAFT
          ? TrainingCandidateStatus.REVIEWED
          : candidate.status,
    });

    if (!this.saveErrorMessage()) {
      this.editingCandidateId.set(null);
    }
  }

  protected approveCandidate(candidateId: string): Promise<void> {
    return this.updateCandidate(candidateId, {
      status: TrainingCandidateStatus.APPROVED,
    });
  }

  protected rejectCandidate(candidateId: string): Promise<void> {
    return this.updateCandidate(candidateId, {
      status: TrainingCandidateStatus.REJECTED,
    });
  }

  protected expectedOutputPreview(candidate: TrainingCandidate): string {
    return JSON.stringify(candidate.expectedOutput);
  }

  protected updateInstruction(event: Event): void {
    this.instruction.set((event.target as HTMLTextAreaElement).value);
  }

  protected updateExpectedOutput(event: Event): void {
    this.expectedOutputText.set((event.target as HTMLTextAreaElement).value);
  }

  protected updateReasoning(event: Event): void {
    this.reasoning.set((event.target as HTMLTextAreaElement).value);
  }

  private async updateCandidate(
    candidateId: string,
    payload: UpdateTrainingCandidateRequest,
  ): Promise<void> {
    if (this.savingCandidateId()) {
      return;
    }

    this.savingCandidateId.set(candidateId);
    this.saveErrorMessage.set('');

    try {
      await this.workspaceService.updateTrainingCandidate(candidateId, payload);
      this.candidatesResource.reload();
    } catch {
      this.saveErrorMessage.set('Training candidate could not be updated.');
    } finally {
      this.savingCandidateId.set(null);
    }
  }

  private parseExpectedOutput(): Record<string, unknown> | null {
    try {
      const parsedOutput: unknown = JSON.parse(this.expectedOutputText());

      if (
        typeof parsedOutput !== 'object' ||
        parsedOutput === null ||
        Array.isArray(parsedOutput)
      ) {
        this.saveErrorMessage.set('Expected output must be a JSON object.');
        return null;
      }

      return parsedOutput as Record<string, unknown>;
    } catch {
      this.saveErrorMessage.set('Expected output must be valid JSON.');
      return null;
    }
  }
}
