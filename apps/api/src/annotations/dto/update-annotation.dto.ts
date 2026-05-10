import type { UpdateAnnotationRequest } from '@task-mind/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAnnotationDto implements UpdateAnnotationRequest {
  @ApiProperty({
    description: 'Updated field name the selected text teaches.',
    example: 'invoiceNumber',
  })
  @IsString()
  @IsNotEmpty()
  fieldName!: string;

  @ApiPropertyOptional({
    description: 'Updated human explanation for why this selected text matters.',
    example: 'This is the invoice identifier printed near the top of the page.',
  })
  @IsString()
  @IsOptional()
  explanation?: string;
}
