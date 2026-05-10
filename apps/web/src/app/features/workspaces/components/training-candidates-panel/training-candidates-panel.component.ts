import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import {
  TrainingCandidateStatus,
  type TrainingCandidate,
} from '@task-mind/shared';

@Component({
  selector: 'app-training-candidates-panel',
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './training-candidates-panel.component.html',
  styleUrl: './training-candidates-panel.component.scss',
})
export class TrainingCandidatesPanelComponent {
  readonly workspaceId = input.required<string>();
  readonly candidates = input.required<TrainingCandidate[]>();
  readonly isLoading = input.required<boolean>();
  readonly errorMessage = input('');

  protected readonly recentCandidates = computed(() =>
    this.candidates().slice(0, 4),
  );
  protected readonly counts = computed(() => {
    const candidates = this.candidates();

    return {
      total: candidates.length,
      draft: this.countByStatus(candidates, TrainingCandidateStatus.DRAFT),
      reviewed: this.countByStatus(
        candidates,
        TrainingCandidateStatus.REVIEWED,
      ),
      approved: this.countByStatus(
        candidates,
        TrainingCandidateStatus.APPROVED,
      ),
      rejected: this.countByStatus(
        candidates,
        TrainingCandidateStatus.REJECTED,
      ),
    };
  });

  private countByStatus(
    candidates: TrainingCandidate[],
    status: TrainingCandidateStatus,
  ): number {
    return candidates.filter((candidate) => candidate.status === status).length;
  }
}
