import { Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  RuleCategory,
  type CreateOperationalRuleRequest,
} from '@task-mind/shared';

@Component({
  selector: 'app-operational-rule-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './operational-rule-form.component.html',
  styleUrl: './operational-rule-form.component.scss',
})
export class OperationalRuleFormComponent {
  readonly isSaving = input.required<boolean>();
  readonly errorMessage = input<string>('');
  readonly saveRule = output<CreateOperationalRuleRequest>();

  protected readonly ruleCategory = RuleCategory;
  protected readonly categories = Object.values(RuleCategory);
  protected readonly title = signal('');
  protected readonly category = signal<RuleCategory>(RuleCategory.EXTRACTION);
  protected readonly ruleText = signal('');
  protected readonly canSave = computed(
    () =>
      Boolean(this.title().trim()) &&
      Boolean(this.ruleText().trim()) &&
      !this.isSaving(),
  );

  protected updateTitle(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected updateRuleText(event: Event): void {
    this.ruleText.set((event.target as HTMLTextAreaElement).value);
  }

  protected updateCategory(category: RuleCategory): void {
    this.category.set(category);
  }

  protected submit(): void {
    if (!this.canSave()) {
      return;
    }

    this.saveRule.emit({
      title: this.title().trim(),
      category: this.category(),
      ruleText: this.ruleText().trim(),
    });
    this.title.set('');
    this.category.set(RuleCategory.EXTRACTION);
    this.ruleText.set('');
  }
}
