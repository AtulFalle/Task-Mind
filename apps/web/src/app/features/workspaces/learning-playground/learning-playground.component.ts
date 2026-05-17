import { PercentPipe } from '@angular/common';
import { Component, computed, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  PlaygroundIntent,
  PlaygroundPriority,
  type PlaygroundClassificationResponse,
} from '@task-mind/shared';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-learning-playground',
  imports: [
    FormsModule,
    PercentPipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './learning-playground.component.html',
  styleUrl: './learning-playground.component.scss',
})
export class LearningPlaygroundComponent {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly intents = Object.values(PlaygroundIntent);
  protected readonly priorities = Object.values(PlaygroundPriority);
  protected readonly workspaceId = computed(() =>
    this.route.snapshot.paramMap.get('workspaceId'),
  );
  protected readonly workspaceResource =
    this.workspaceService.getWorkspaceResource(this.workspaceId, this.injector);
  protected readonly workspace = this.workspaceResource.value;
  protected readonly rulesResource = this.workspaceService.getWorkspaceRules(
    this.workspaceId,
    this.injector,
  );
  protected readonly rules = this.rulesResource.value;
  protected readonly examplesResource =
    this.workspaceService.getPlaygroundExamples(this.workspaceId, this.injector);
  protected readonly examples = this.examplesResource.value;
  protected readonly metricsResource = this.workspaceService.getPlaygroundMetrics(
    this.workspaceId,
    this.injector,
  );
  protected readonly metrics = this.metricsResource.value;
  protected readonly inputText = signal('');
  protected readonly selectedIntent = signal<PlaygroundIntent>(
    PlaygroundIntent.UNKNOWN,
  );
  protected readonly selectedPriority = signal<PlaygroundPriority>(
    PlaygroundPriority.MEDIUM,
  );
  protected readonly correctionReason = signal('');
  protected readonly prediction = signal<PlaygroundClassificationResponse | null>(
    null,
  );
  protected readonly isClassifying = signal(false);
  protected readonly isSavingFeedback = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly activeRules = computed(() => this.rules().slice(0, 5));
  protected readonly reviewedExamples = computed(() =>
    this.examples().filter((example) => example.status !== 'PENDING').slice(0, 8),
  );
  protected readonly canClassify = computed(
    () => Boolean(this.inputText().trim()) && !this.isClassifying(),
  );
  protected readonly canSaveCorrection = computed(
    () =>
      Boolean(this.prediction()) &&
      Boolean(this.correctionReason().trim()) &&
      !this.isSavingFeedback(),
  );

  protected async classify(): Promise<void> {
    const workspaceId = this.workspaceId();
    const inputText = this.inputText().trim();

    if (!workspaceId || !inputText || this.isClassifying()) {
      return;
    }

    this.isClassifying.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const prediction = await this.workspaceService.classifyPlaygroundMessage(
        workspaceId,
        { inputText },
      );
      this.prediction.set(prediction);
      this.selectedIntent.set(prediction.intent);
      this.selectedPriority.set(prediction.priority);
      this.correctionReason.set('');
      this.examplesResource.reload();
      this.metricsResource.reload();
    } catch {
      this.errorMessage.set('TaskMindAI could not classify this message.');
    } finally {
      this.isClassifying.set(false);
    }
  }

  protected async approve(): Promise<void> {
    const prediction = this.prediction();

    if (!prediction || this.isSavingFeedback()) {
      return;
    }

    this.isSavingFeedback.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.workspaceService.approvePlaygroundExample(prediction.exampleId);
      this.successMessage.set('Approved. This example is now teaching memory.');
      this.afterFeedbackSaved();
    } catch {
      this.errorMessage.set('Approval could not be saved.');
    } finally {
      this.isSavingFeedback.set(false);
    }
  }

  protected async saveCorrection(): Promise<void> {
    const prediction = this.prediction();
    const correctionReason = this.correctionReason().trim();

    if (!prediction || !correctionReason || this.isSavingFeedback()) {
      return;
    }

    this.isSavingFeedback.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.workspaceService.correctPlaygroundExample(
        prediction.exampleId,
        {
          finalIntent: this.selectedIntent(),
          finalPriority: this.selectedPriority(),
          correctionReason,
        },
      );
      this.successMessage.set('Correction saved for future predictions.');
      this.afterFeedbackSaved();
    } catch {
      this.errorMessage.set('Correction could not be saved.');
    } finally {
      this.isSavingFeedback.set(false);
    }
  }

  protected resetForNextMessage(): void {
    this.inputText.set('');
    this.prediction.set(null);
    this.correctionReason.set('');
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  protected previewText(value: string): string {
    return value.length > 120 ? `${value.slice(0, 120)}...` : value;
  }

  private afterFeedbackSaved(): void {
    this.examplesResource.reload();
    this.metricsResource.reload();
  }
}
