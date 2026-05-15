import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  SuggestionMode,
  type AiSuggestionRequest,
} from '@task-mind/shared';
import { IsEnum, IsOptional } from 'class-validator';

export class AiSuggestionRequestDto implements AiSuggestionRequest {
  @ApiPropertyOptional({
    description: 'Suggestion workflow to run for this document.',
    enum: SuggestionMode,
    example: SuggestionMode.DOCUMENT_CLASSIFICATION,
    default: SuggestionMode.EXTRACTION,
  })
  @IsEnum(SuggestionMode)
  @IsOptional()
  mode?: SuggestionMode;
}
