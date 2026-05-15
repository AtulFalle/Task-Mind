import { ApiProperty } from '@nestjs/swagger';
import type { WorkspaceValidationMetrics } from '@task-mind/shared';

export class WorkspaceValidationMetricsDto
  implements WorkspaceValidationMetrics
{
  @ApiProperty({
    description: 'Workspace these validation metrics belong to.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  workspaceId!: string;

  @ApiProperty({ description: 'Total persisted AI suggestions.', example: 24 })
  totalSuggestions!: number;

  @ApiProperty({ description: 'AI suggestions approved as-is.', example: 14 })
  approvedSuggestions!: number;

  @ApiProperty({
    description: 'AI suggestions rejected by humans.',
    example: 4,
  })
  rejectedSuggestions!: number;

  @ApiProperty({ description: 'AI suggestions edited by humans.', example: 6 })
  editedSuggestions!: number;

  @ApiProperty({
    description: 'AI suggestions converted directly into annotations.',
    example: 3,
  })
  convertedToAnnotations!: number;

  @ApiProperty({
    description: 'Document classification suggestions predicted as UNKNOWN.',
    example: 5,
  })
  unknownPredictions!: number;

  @ApiProperty({
    description: 'Human corrections where the final label is UNKNOWN.',
    example: 3,
  })
  unknownCorrections!: number;

  @ApiProperty({
    description:
      'Document classification suggestions corrected from a known label to UNKNOWN.',
    example: 2,
  })
  forcedClassificationErrors!: number;

  @ApiProperty({
    description: 'approvedSuggestions divided by totalSuggestions.',
    example: 0.58,
  })
  approvalRate!: number;

  @ApiProperty({
    description:
      'editedSuggestions plus rejectedSuggestions divided by totalSuggestions.',
    example: 0.42,
  })
  correctionRate!: number;

  @ApiProperty({
    description: 'rejectedSuggestions divided by totalSuggestions.',
    example: 0.17,
  })
  rejectionRate!: number;

  @ApiProperty({
    description: 'unknownPredictions divided by totalSuggestions.',
    example: 0.21,
  })
  applicabilityRejectionRate!: number;

  @ApiProperty({
    description: 'Total annotations in the workspace.',
    example: 31,
  })
  totalAnnotations!: number;

  @ApiProperty({
    description: 'Total operational rules in the workspace.',
    example: 8,
  })
  totalRules!: number;

  @ApiProperty({
    description: 'Total training candidates in the workspace.',
    example: 12,
  })
  totalTrainingCandidates!: number;
}
