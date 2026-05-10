import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AiSuggestion } from '@task-mind/shared';
import { AiSuggestionStatus } from '@task-mind/shared';

export class AiAnnotationSuggestionDto implements AiSuggestion {
  @ApiProperty({
    description: 'Persisted AI suggestion id.',
    example: 'c3f2f6c1-0bd8-4430-a5a1-4d4f6f0a4b5e',
  })
  id!: string;

  @ApiProperty({
    description: 'Workspace id for teaching-memory lookup.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  workspaceId!: string;

  @ApiProperty({
    description: 'Document id this suggestion belongs to.',
    example: 'adabf117-d9ec-44a9-9107-97d01191c4ec',
  })
  documentId!: string;

  @ApiPropertyOptional({
    description: 'Annotation id when the suggestion has been converted.',
    example: 'e2db29a9-7e3a-40c5-a965-ae1c8d9070d1',
  })
  annotationId?: string;

  @ApiProperty({
    description: 'Suggested extraction field name.',
    example: 'experience',
  })
  fieldName!: string;

  @ApiProperty({
    description: 'Verbatim text selected from the document.',
    example: '5 years of product operations experience',
  })
  selectedText!: string;

  @ApiProperty({
    description: 'Auditable reason for this suggestion.',
    example: 'Matches the workspace rule for experience requirements.',
  })
  reasoning!: string;

  @ApiProperty({
    description: 'Model confidence from 0 to 1.',
    minimum: 0,
    maximum: 1,
    example: 0.72,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Human review status for this AI suggestion.',
    enum: AiSuggestionStatus,
    example: AiSuggestionStatus.PENDING,
  })
  status!: AiSuggestionStatus;

  @ApiPropertyOptional({
    description: 'Human-corrected field name.',
    example: 'yearsOfExperience',
  })
  correctedFieldName?: string;

  @ApiPropertyOptional({
    description: 'Human-corrected selected text.',
    example: '5 years',
  })
  correctedSelectedText?: string;

  @ApiPropertyOptional({
    description: 'Human explanation for the correction.',
    example: 'The field should capture the numeric years only.',
  })
  correctedReasoning?: string;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-05-10T16:30:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-05-10T16:35:00.000Z',
  })
  updatedAt!: string;
}
