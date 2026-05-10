import { ApiProperty } from '@nestjs/swagger';
import type { UpdateAiSuggestionRequest } from '@task-mind/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAiSuggestionDto implements UpdateAiSuggestionRequest {
  @ApiProperty({
    description: 'Human-corrected extraction field name.',
    example: 'yearsOfExperience',
  })
  @IsString()
  @IsNotEmpty()
  correctedFieldName!: string;

  @ApiProperty({
    description: 'Human-corrected verbatim document text.',
    example: '5 years',
  })
  @IsString()
  @IsNotEmpty()
  correctedSelectedText!: string;

  @ApiProperty({
    description: 'Human explanation for the correction.',
    example: 'The original suggestion included extra words around the value.',
  })
  @IsString()
  @IsNotEmpty()
  correctedReasoning!: string;
}
