import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, type UpdateAiSuggestionRequest } from '@task-mind/shared';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAiSuggestionDto implements UpdateAiSuggestionRequest {
  @ApiProperty({
    description: 'Human-corrected extraction field name.',
    example: 'yearsOfExperience',
    required: false,
  })
  @IsString()
  @IsOptional()
  correctedFieldName?: string;

  @ApiProperty({
    description: 'Human-corrected verbatim document text.',
    example: '5 years',
    required: false,
  })
  @IsString()
  @IsOptional()
  correctedSelectedText?: string;

  @ApiProperty({
    description: 'Human explanation for the correction.',
    example: 'The original suggestion included extra words around the value.',
    required: false,
  })
  @IsString()
  @IsOptional()
  correctedReasoning?: string;

  @ApiProperty({
    description: 'Human-corrected document type for classification suggestions.',
    enum: DocumentType,
    example: DocumentType.BANK_STATEMENT,
    required: false,
  })
  @IsEnum(DocumentType)
  @IsOptional()
  correctedDocumentType?: DocumentType;
}
