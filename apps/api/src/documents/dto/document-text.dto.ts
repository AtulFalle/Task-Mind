import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ExtractedTextStatus,
  type DocumentTextResponse,
} from '@task-mind/shared';

export class DocumentTextDto implements DocumentTextResponse {
  @ApiProperty({
    description: 'Document identifier.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  documentId!: string;

  @ApiProperty({
    description: 'Current text extraction status.',
    enum: ExtractedTextStatus,
    example: ExtractedTextStatus.COMPLETED,
  })
  status!: ExtractedTextStatus;

  @ApiProperty({
    description: 'Extracted plain text when available.',
    nullable: true,
    example: 'Invoice #1001\nTotal: $245.00',
  })
  text!: string | null;

  @ApiPropertyOptional({
    description: 'Extraction failure message when parsing failed.',
    example: 'Unable to parse the uploaded document.',
  })
  error?: string;
}
