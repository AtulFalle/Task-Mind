import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ValidationRunItemStatus,
  type AddValidationRunItemRequest,
} from '@task-mind/shared';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AddValidationRunItemDto implements AddValidationRunItemRequest {
  @ApiPropertyOptional({
    description: 'Document id used for this validation item.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @IsString()
  @IsOptional()
  documentId?: string;

  @ApiPropertyOptional({
    description: 'AI suggestion id captured for this validation item.',
    example: 'c3f2f6c1-0bd8-4430-a5a1-4d4f6f0a4b5e',
  })
  @IsString()
  @IsOptional()
  aiSuggestionId?: string;

  @ApiPropertyOptional({
    description: 'Expected document type label.',
    example: 'INVOICE',
  })
  @IsString()
  @IsOptional()
  expectedLabel?: string;

  @ApiPropertyOptional({
    description: 'Predicted document type label.',
    example: 'RESUME',
  })
  @IsString()
  @IsOptional()
  predictedLabel?: string;

  @ApiPropertyOptional({
    description: 'Final human-reviewed document type label.',
    example: 'INVOICE',
  })
  @IsString()
  @IsOptional()
  finalLabel?: string;

  @ApiProperty({
    description: 'Human review outcome for this item.',
    enum: ValidationRunItemStatus,
    example: ValidationRunItemStatus.EDITED,
  })
  @IsEnum(ValidationRunItemStatus)
  status!: ValidationRunItemStatus;
}
