import { ApiProperty } from '@nestjs/swagger';
import {
  DocumentType,
  type DocumentTypeValidationSample,
  type DocumentTypeValidationSamplesResponse,
} from '@task-mind/shared';

export class DocumentTypeValidationSampleDto
  implements DocumentTypeValidationSample
{
  @ApiProperty({
    description: 'Stable sample id.',
    example: 'invoice-001',
  })
  id!: string;

  @ApiProperty({
    description: 'Human-readable sample title.',
    example: 'Invoice with due date',
  })
  title!: string;

  @ApiProperty({
    description: 'Short document text to upload manually.',
    example: 'Invoice INV-1048\nAmount due: $2,450.00',
  })
  text!: string;

  @ApiProperty({
    description: 'Expected document type for manual validation.',
    enum: DocumentType,
    example: DocumentType.INVOICE,
  })
  expectedType!: DocumentType;

  @ApiProperty({
    description: 'Why the expected label is correct.',
    example: 'Contains invoice number, due date, and total amount.',
  })
  reason!: string;
}

export class DocumentTypeValidationSamplesResponseDto
  implements DocumentTypeValidationSamplesResponse
{
  @ApiProperty({
    description: 'Manual document type validation samples.',
    type: DocumentTypeValidationSampleDto,
    isArray: true,
  })
  samples!: DocumentTypeValidationSampleDto[];
}
