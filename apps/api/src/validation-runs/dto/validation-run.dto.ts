import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ValidationRunItemStatus,
  ValidationRunMode,
  ValidationRunStatus,
  type ValidationRun,
  type ValidationRunItem,
} from '@task-mind/shared';

export class ValidationRunItemDto implements ValidationRunItem {
  @ApiProperty({ description: 'Validation run item id.' })
  id!: string;

  @ApiProperty({ description: 'Parent validation run id.' })
  validationRunId!: string;

  @ApiPropertyOptional({ description: 'Document id.' })
  documentId?: string;

  @ApiPropertyOptional({ description: 'AI suggestion id.' })
  aiSuggestionId?: string;

  @ApiPropertyOptional({ description: 'Expected label.' })
  expectedLabel?: string;

  @ApiPropertyOptional({ description: 'Predicted label.' })
  predictedLabel?: string;

  @ApiPropertyOptional({ description: 'Final reviewed label.' })
  finalLabel?: string;

  @ApiProperty({
    description: 'Validation item status.',
    enum: ValidationRunItemStatus,
  })
  status!: ValidationRunItemStatus;

  @ApiProperty({ description: 'Creation timestamp.' })
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp.' })
  updatedAt!: string;
}

export class ValidationRunDto implements ValidationRun {
  @ApiProperty({ description: 'Validation run id.' })
  id!: string;

  @ApiProperty({ description: 'Workspace id.' })
  workspaceId!: string;

  @ApiProperty({ description: 'Validation run name.' })
  name!: string;

  @ApiPropertyOptional({ description: 'Validation run description.' })
  description?: string;

  @ApiProperty({
    description: 'Validation run mode.',
    enum: ValidationRunMode,
  })
  mode!: ValidationRunMode;

  @ApiProperty({
    description: 'Validation run status.',
    enum: ValidationRunStatus,
  })
  status!: ValidationRunStatus;

  @ApiProperty({ description: 'Total captured items.' })
  totalItems!: number;

  @ApiProperty({ description: 'Approved item count.' })
  approvedCount!: number;

  @ApiProperty({ description: 'Rejected item count.' })
  rejectedCount!: number;

  @ApiProperty({ description: 'Edited item count.' })
  editedCount!: number;

  @ApiProperty({ description: 'Correction rate from 0 to 1.' })
  correctionRate!: number;

  @ApiProperty({ description: 'Approval rate from 0 to 1.' })
  approvalRate!: number;

  @ApiProperty({ description: 'Run start timestamp.' })
  startedAt!: string;

  @ApiPropertyOptional({ description: 'Run completion timestamp.' })
  completedAt?: string;

  @ApiProperty({ description: 'Creation timestamp.' })
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp.' })
  updatedAt!: string;

  @ApiPropertyOptional({
    description: 'Validation run items.',
    type: ValidationRunItemDto,
    isArray: true,
  })
  items?: ValidationRunItemDto[];
}
