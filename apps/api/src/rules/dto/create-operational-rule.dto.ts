import { ApiProperty } from '@nestjs/swagger';
import {
  RuleCategory,
  type CreateOperationalRuleRequest,
} from '@task-mind/shared';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateOperationalRuleDto
  implements CreateOperationalRuleRequest
{
  @ApiProperty({
    description: 'Short human-readable title for the operational rule.',
    example: 'Experience section structure',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Human-written instruction that teaches workspace behavior.',
    example:
      'Experience section usually contains role title, company name, duration, and short description.',
  })
  @IsString()
  @IsNotEmpty()
  ruleText!: string;

  @ApiProperty({
    description: 'Rule category.',
    enum: RuleCategory,
    example: RuleCategory.EXTRACTION,
  })
  @IsEnum(RuleCategory)
  category!: RuleCategory;
}
