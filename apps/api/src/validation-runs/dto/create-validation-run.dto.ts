import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ValidationRunMode,
  type CreateValidationRunRequest,
} from '@task-mind/shared';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateValidationRunDto implements CreateValidationRunRequest {
  @ApiProperty({
    description: 'Human-readable validation run name.',
    example: 'Round 1 - Baseline',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional run purpose or notes.',
    example: 'First run before feedback memory improves.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Validation workflow mode.',
    enum: ValidationRunMode,
    example: ValidationRunMode.DOCUMENT_CLASSIFICATION,
  })
  @IsEnum(ValidationRunMode)
  mode!: ValidationRunMode;
}
