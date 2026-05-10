import { ApiProperty } from '@nestjs/swagger';
import type { AiAnnotationSuggestionsResponse } from '@task-mind/shared';
import { AiAnnotationSuggestionDto } from './ai-annotation-suggestion.dto';

export class AiAnnotationSuggestionsResponseDto
  implements AiAnnotationSuggestionsResponse
{
  @ApiProperty({
    description: 'AI-proposed annotations for human review.',
    type: AiAnnotationSuggestionDto,
    isArray: true,
  })
  suggestions!: AiAnnotationSuggestionDto[];
}
