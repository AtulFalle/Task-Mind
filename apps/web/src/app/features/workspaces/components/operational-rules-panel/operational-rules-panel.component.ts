import { Component, input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type {
  CreateOperationalRuleRequest,
  OperationalRule,
} from '@task-mind/shared';
import { OperationalRuleCardComponent } from '../operational-rule-card/operational-rule-card.component';
import { OperationalRuleFormComponent } from '../operational-rule-form/operational-rule-form.component';

@Component({
  selector: 'app-operational-rules-panel',
  imports: [
    MatProgressSpinnerModule,
    OperationalRuleCardComponent,
    OperationalRuleFormComponent,
  ],
  templateUrl: './operational-rules-panel.component.html',
  styleUrl: './operational-rules-panel.component.scss',
})
export class OperationalRulesPanelComponent {
  readonly rules = input.required<OperationalRule[]>();
  readonly isLoading = input.required<boolean>();
  readonly isSaving = input.required<boolean>();
  readonly errorMessage = input<string>('');
  readonly saveErrorMessage = input<string>('');
  readonly deletingRuleId = input<string | null>(null);
  readonly createRule = output<CreateOperationalRuleRequest>();
  readonly deleteRule = output<string>();
}
