import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  TrainingCandidateStatus,
  TrainingCandidateType,
  type UpdateTrainingCandidateRequest,
} from '@task-mind/shared';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateTrainingCandidateDto
  implements UpdateTrainingCandidateRequest
{
  @ApiPropertyOptional({
    description: 'Updated candidate category.',
    enum: TrainingCandidateType,
    example: TrainingCandidateType.EXTRACTION,
  })
  @IsOptional()
  @IsEnum(TrainingCandidateType)
  candidateType?: TrainingCandidateType;

  @ApiPropertyOptional({
    description: 'Updated input text.',
    example: 'Software Engineer at Google, 2021-2024',
  })
  @IsOptional()
  @IsString()
  inputText?: string;

  @ApiPropertyOptional({
    description: 'Updated expected output represented as JSON.',
    example: {
      fieldName: 'experience',
      value: 'Software Engineer at Google, 2021-2024',
    },
  })
  @IsOptional()
  @IsObject()
  expectedOutput?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Updated instruction.',
    example: 'Extract the experience field from the document text.',
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional({
    description: 'Updated reasoning.',
    example: 'This is a complete experience phrase.',
  })
  @IsOptional()
  @IsString()
  reasoning?: string;

  @ApiPropertyOptional({
    description: 'Updated review status.',
    enum: TrainingCandidateStatus,
    example: TrainingCandidateStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(TrainingCandidateStatus)
  status?: TrainingCandidateStatus;
}
