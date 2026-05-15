import { Component, computed, inject, Injector } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { AiContextStats, WorkspaceValidationMetrics } from '@task-mind/shared';
import { WorkspaceService } from '../../../workspaces/workspace.service';

interface ValidationChecklistItem {
  label: string;
  complete: boolean;
}

interface ValidationStep {
  title: string;
  body: string;
}

interface MetricDisplay {
  label: string;
  value: string;
}

interface ContextStatDisplay {
  label: string;
  value: number;
}

@Component({
  selector: 'app-validation-flow',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './validation-flow.component.html',
  styleUrl: './validation-flow.component.scss',
})
export class ValidationFlowComponent {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly workspaceResource =
    this.workspaceService.getWorkspaceResource(this.workspaceId, this.injector);
  protected readonly readinessResource =
    this.workspaceService.getWorkspaceValidationReadinessResource(
      this.workspaceId,
      this.injector,
    );
  protected readonly metricsResource =
    this.workspaceService.getWorkspaceValidationMetricsResource(
      this.workspaceId,
      this.injector,
    );
  protected readonly workspace = this.workspaceResource.value;
  protected readonly readiness = this.readinessResource.value;
  protected readonly metrics = this.metricsResource.value;
  protected readonly checklist = computed<ValidationChecklistItem[]>(() => {
    const readiness = this.readiness();
    const hasWorkspace = Boolean(this.workspace());

    return [
      { label: 'Workspace exists', complete: hasWorkspace },
      { label: 'Rules added', complete: readiness?.hasRules ?? false },
      {
        label: 'Documents uploaded',
        complete: readiness?.hasDocuments ?? false,
      },
      {
        label: 'AI service reachable',
        complete: readiness?.aiServiceReachable ?? false,
      },
      {
        label: 'At least one suggestion generated',
        complete: readiness?.hasAiSuggestions ?? false,
      },
      {
        label: 'At least one correction/approval saved',
        complete: readiness?.hasHumanFeedback ?? false,
      },
    ];
  });
  protected readonly metricStats = computed<MetricDisplay[]>(() =>
    this.toMetricStats(this.metrics()),
  );
  protected readonly contextStats = computed<ContextStatDisplay[]>(() =>
    this.toContextStats(this.readiness()?.latestContextStats),
  );
  protected readonly steps: ValidationStep[] = [
    {
      title: 'Step 1: Add rules',
      body: 'Create operational rules for the document types this workspace should recognize.',
    },
    {
      title: 'Step 2: Upload sample document',
      body: 'Upload one short sample, then open it and extract text.',
    },
    {
      title: 'Step 3: Run classification',
      body: 'Ask TaskMindAI to classify the document from the document detail screen.',
    },
    {
      title: 'Step 4: Correct result',
      body: 'Approve the suggestion if it is right, reject it if it should not apply, or correct the document type.',
    },
    {
      title: 'Step 5: Upload next sample',
      body: 'Add another sample of the same type or a deliberate UNKNOWN example.',
    },
    {
      title: 'Step 6: Run again',
      body: 'Run classification again and inspect the context evidence on this page.',
    },
    {
      title: 'Step 7: Compare metrics',
      body: 'Check whether approval, correction, rejection, and UNKNOWN metrics changed after human guidance.',
    },
  ];
  protected readonly isLoading = computed(
    () =>
      this.workspaceResource.isLoading() ||
      this.readinessResource.isLoading() ||
      this.metricsResource.isLoading(),
  );
  protected readonly errorMessage = computed(() => {
    if (!this.workspaceId()) {
      return 'Workspace id is missing.';
    }

    if (this.workspaceResource.error()) {
      return 'Workspace could not be loaded.';
    }

    if (this.readinessResource.error()) {
      return 'Validation readiness could not be loaded.';
    }

    if (this.metricsResource.error()) {
      return 'Validation metrics could not be loaded.';
    }

    return '';
  });

  private toMetricStats(
    metrics: WorkspaceValidationMetrics | undefined,
  ): MetricDisplay[] {
    if (!metrics) {
      return [];
    }

    return [
      {
        label: 'Total suggestions',
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
    ];
  }

  private toContextStats(
    contextStats: AiContextStats | undefined,
  ): ContextStatDisplay[] {
    return [
      {
        label: 'Rules used',
        value: contextStats?.rulesUsed ?? 0,
      },
      {
        label: 'Approved examples used',
        value: contextStats?.approvedExamplesUsed ?? 0,
      },
      {
        label: 'Corrected examples used',
        value: contextStats?.correctedExamplesUsed ?? 0,
      },
      {
        label: 'Rejected examples used',
        value: contextStats?.rejectedExamplesUsed ?? 0,
      },
    ];
  }

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
