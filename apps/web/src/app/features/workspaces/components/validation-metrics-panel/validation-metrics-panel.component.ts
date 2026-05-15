import { Component, computed, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { WorkspaceValidationMetrics } from '@task-mind/shared';

interface ValidationMetricStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-validation-metrics-panel',
  imports: [MatProgressSpinnerModule],
  templateUrl: './validation-metrics-panel.component.html',
  styleUrl: './validation-metrics-panel.component.scss',
})
export class ValidationMetricsPanelComponent {
  readonly metrics = input<WorkspaceValidationMetrics | undefined>();
  readonly isLoading = input.required<boolean>();
  readonly errorMessage = input('');

  protected readonly stats = computed<ValidationMetricStat[]>(() => {
    const metrics = this.metrics();

    if (!metrics) {
      return [];
    }

    return [
      {
        label: 'Total AI suggestions',
        value: this.formatCount(metrics.totalSuggestions),
      },
      {
        label: 'Approval rate',
        value: this.formatRate(metrics.approvalRate),
      },
      {
        label: 'Correction rate',
        value: this.formatRate(metrics.correctionRate),
      },
      {
        label: 'Rejection rate',
        value: this.formatRate(metrics.rejectionRate),
      },
      {
        label: 'UNKNOWN predictions',
        value: this.formatCount(metrics.unknownPredictions),
      },
      {
        label: 'Forced classification errors',
        value: this.formatCount(metrics.forcedClassificationErrors),
      },
      {
        label: 'Applicability rejection rate',
        value: this.formatRate(metrics.applicabilityRejectionRate),
      },
      {
        label: 'Annotations',
        value: this.formatCount(metrics.totalAnnotations),
      },
      {
        label: 'Rules',
        value: this.formatCount(metrics.totalRules),
      },
      {
        label: 'Training candidates',
        value: this.formatCount(metrics.totalTrainingCandidates),
      },
    ];
  });

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatRate(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      style: 'percent',
    }).format(value);
  }
}
