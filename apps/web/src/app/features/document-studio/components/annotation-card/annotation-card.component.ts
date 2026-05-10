import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import type {
  Annotation,
  LinkedOperationalRule,
  OperationalRule,
} from '@task-mind/shared';

@Component({
  selector: 'app-annotation-card',
  imports: [
    DatePipe,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './annotation-card.component.html',
  styleUrl: './annotation-card.component.scss',
})
export class AnnotationCardComponent {
  readonly annotation = input.required<Annotation>();
  readonly isDeleting = input.required<boolean>();
  readonly isActive = input(false);
  readonly workspaceRules = input<OperationalRule[]>([]);
  readonly linkedRules = input<LinkedOperationalRule[]>([]);
  readonly isLinkingRule = input(false);
  readonly deleteAnnotation = output<string>();
  readonly editAnnotation = output<Annotation>();
  readonly selectAnnotation = output<string>();
  readonly linkRule = output<{ annotationId: string; ruleId: string }>();
  readonly unlinkRule = output<{ annotationId: string; ruleId: string }>();
  readonly createTrainingCandidate = output<string>();

  protected readonly availableRules = computed(() => {
    const linkedRuleIds = new Set(this.linkedRules().map((rule) => rule.id));

    return this.workspaceRules().filter((rule) => !linkedRuleIds.has(rule.id));
  });
}
