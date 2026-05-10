import { ApiProperty } from '@nestjs/swagger';
import {
  RuleCategory,
  RuleSource,
  type OperationalRule,
} from '@task-mind/shared';

export class OperationalRuleDto implements OperationalRule {
  @ApiProperty({
    description: 'Unique operational rule identifier.',
    example: '3f64d20c-ae9a-4c06-bb62-b71f65d10c75',
  })
  id!: string;

  @ApiProperty({
    description: 'Workspace that owns this rule.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  workspaceId!: string;

  @ApiProperty({
    description: 'Short rule title.',
    example: 'Experience section structure',
  })
  title!: string;

  @ApiProperty({
    description: 'Human-written teaching instruction.',
    example:
      'Experience section usually contains role title, company name, duration, and short description.',
  })
  ruleText!: string;

  @ApiProperty({
    description: 'Rule category.',
    enum: RuleCategory,
    example: RuleCategory.EXTRACTION,
  })
  category!: RuleCategory;

  @ApiProperty({
    description: 'Rule source. MVP rules are human-authored.',
    enum: RuleSource,
    example: RuleSource.HUMAN,
  })
  source!: RuleSource;

  @ApiProperty({
    description: 'Rule confidence. Human MVP rules default to 1.',
    example: 1,
  })
  confidence!: number;

  @ApiProperty({
    description: 'ISO timestamp for when the rule was created.',
    example: '2026-05-10T11:15:20.085Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'ISO timestamp for when the rule was last updated.',
    example: '2026-05-10T11:15:20.085Z',
  })
  updatedAt!: string;
}
