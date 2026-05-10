import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateAnnotationRequest } from '@task-mind/shared';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAnnotationDto implements CreateAnnotationRequest {
  @ApiProperty({
    description: 'Field name the selected text teaches.',
    example: 'invoiceNumber',
  })
  @IsString()
  @IsNotEmpty()
  fieldName!: string;

  @ApiProperty({
    description: 'Exact text selected from the extracted document text.',
    example: 'INV-1001',
  })
  @IsString()
  @IsNotEmpty()
  selectedText!: string;

  @ApiPropertyOptional({
    description: 'Human explanation for why this selected text matters.',
    example: 'This is the invoice identifier printed near the top of the page.',
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({
    description: 'Optional start character offset in extracted text.',
    example: 42,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  startOffset?: number;

  @ApiPropertyOptional({
    description: 'Optional end character offset in extracted text.',
    example: 50,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  endOffset?: number;
}
