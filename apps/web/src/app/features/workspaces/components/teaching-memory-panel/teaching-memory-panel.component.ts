import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { FeedbackEvent } from '@task-mind/shared';
import { FeedbackEventCardComponent } from '../feedback-event-card/feedback-event-card.component';

@Component({
  selector: 'app-teaching-memory-panel',
  imports: [FeedbackEventCardComponent, MatProgressSpinnerModule],
  templateUrl: './teaching-memory-panel.component.html',
  styleUrl: './teaching-memory-panel.component.scss',
})
export class TeachingMemoryPanelComponent {
  readonly events = input.required<FeedbackEvent[]>();
  readonly isLoading = input.required<boolean>();
  readonly errorMessage = input<string>('');
  readonly emptyMessage = input(
    'No teaching activity yet. Upload documents, create annotations, or add rules to begin teaching TaskMindAI.',
  );
}
