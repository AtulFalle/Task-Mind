import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TrainingCandidateStatus,
  TrainingCandidateType,
  type TrainingCandidate,
} from '@task-mind/shared';

export class TrainingCandidateDto implements TrainingCandidate {
  @ApiProperty({
    description: 'Unique training candidate identifier.',
    example: '79d25dd8-6164-4d1c-9f2c-115778231375',
  })
  id!: string;

  @ApiProperty({
    description: 'Workspace that owns this curated teaching example.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  workspaceId!: string;

  @ApiPropertyOptional({
    description: 'Source document for this candidate, when available.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  documentId?: string;

  @ApiPropertyOptional({
    description: 'Source annotation for this candidate, when available.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  annotationId?: string;

  @ApiProperty({
    description: 'Training candidate category.',
    enum: TrainingCandidateType,
    example: TrainingCandidateType.EXTRACTION,
  })
  candidateType!: TrainingCandidateType;

  @ApiProperty({
    description: 'Input text that future training data may use.',
    example: 'Software Engineer at Google, 2021-2024',
  })
  inputText!: string;

  @ApiProperty({
    description: 'Expected structured output for the input text.',
    example: {
      fieldName: 'experience',
      value: 'Software Engineer at Google, 2021-2024',
    },
  })
  expectedOutput!: Record<string, unknown>;

  @ApiProperty({
    description: 'Human-authored instruction for the candidate.',
    example: 'Extract the experience field from the document text.',
  })
  instruction!: string;

  @ApiPropertyOptional({
    description: 'Human reasoning for why this candidate is useful.',
    example: 'The selected text includes role, company, and duration.',
  })
  reasoning?: string;

  @ApiProperty({
    description: 'Review status for this candidate.',
    enum: TrainingCandidateStatus,
    example: TrainingCandidateStatus.DRAFT,
  })
  status!: TrainingCandidateStatus;

  @ApiProperty({
    description: 'ISO timestamp for when the candidate was created.',
    example: '2026-05-10T11:15:20.085Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'ISO timestamp for when the candidate was last updated.',
    example: '2026-05-10T11:15:20.085Z',
  })
  updatedAt!: string;
}
