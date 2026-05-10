import { ApiPropertyOptional } from '@nestjs/swagger';
import type { RejectAiSuggestionRequest } from '@task-mind/shared';
import { IsOptional, IsString } from 'class-validator';

export class RejectAiSuggestionDto implements RejectAiSuggestionRequest {
  @ApiPropertyOptional({
    description: 'Optional human reason for rejecting the suggestion.',
    example: 'The selected text is not the requested field.',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
