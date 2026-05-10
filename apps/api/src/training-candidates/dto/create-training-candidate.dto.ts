import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TrainingCandidateStatus,
  TrainingCandidateType,
  type CreateTrainingCandidateRequest,
} from '@task-mind/shared';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTrainingCandidateDto
  implements CreateTrainingCandidateRequest
{
  @ApiPropertyOptional({
    description: 'Source document id, when this candidate came from a document.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiPropertyOptional({
    description:
      'Source annotation id, when this candidate came from an annotation.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  @IsOptional()
  @IsString()
  annotationId?: string;

  @ApiProperty({
    description: 'Candidate category.',
    enum: TrainingCandidateType,
    example: TrainingCandidateType.EXTRACTION,
  })
  @IsEnum(TrainingCandidateType)
  candidateType!: TrainingCandidateType;

  @ApiProperty({
    description: 'Input text for the training candidate.',
    example: 'Software Engineer at Google, 2021-2024',
  })
  @IsString()
  @IsNotEmpty()
  inputText!: string;

  @ApiProperty({
    description: 'Expected output represented as JSON.',
    example: {
      fieldName: 'experience',
      value: 'Software Engineer at Google, 2021-2024',
    },
  })
  @IsObject()
  expectedOutput!: Record<string, unknown>;

  @ApiProperty({
    description: 'Human-authored instruction for the future example.',
    example: 'Extract the experience field from the document text.',
  })
  @IsString()
  @IsNotEmpty()
  instruction!: string;

  @ApiPropertyOptional({
    description: 'Human reasoning for why this candidate matters.',
    example: 'This is a complete experience phrase.',
  })
  @IsOptional()
  @IsString()
  reasoning?: string;

  @ApiPropertyOptional({
    description: 'Initial review status. Defaults to DRAFT.',
    enum: TrainingCandidateStatus,
    example: TrainingCandidateStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(TrainingCandidateStatus)
  status?: TrainingCandidateStatus;
}
