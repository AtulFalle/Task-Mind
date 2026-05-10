import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { OperationalRule } from '@task-mind/shared';

@Component({
  selector: 'app-operational-rule-card',
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './operational-rule-card.component.html',
  styleUrl: './operational-rule-card.component.scss',
})
export class OperationalRuleCardComponent {
  readonly rule = input.required<OperationalRule>();
  readonly isDeleting = input.required<boolean>();
  readonly deleteRule = output<string>();
}
