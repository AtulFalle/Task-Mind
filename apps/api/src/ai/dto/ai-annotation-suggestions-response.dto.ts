import { ApiProperty } from '@nestjs/swagger';
import type { AiAnnotationSuggestionsResponse } from '@task-mind/shared';
import { AiAnnotationSuggestionDto } from './ai-annotation-suggestion.dto';

class AiContextStatsDto {
  @ApiProperty({ description: 'Operational rules included in the AI context.' })
  rulesUsed!: number;

  @ApiProperty({ description: 'Approved examples included in the AI context.' })
  approvedExamplesUsed!: number;

  @ApiProperty({ description: 'Corrected examples included in the AI context.' })
  correctedExamplesUsed!: number;

  @ApiProperty({ description: 'Rejected examples included in the AI context.' })
  rejectedExamplesUsed!: number;
}

export class AiAnnotationSuggestionsResponseDto
  implements AiAnnotationSuggestionsResponse
{
  @ApiProperty({
    description: 'AI-proposed annotations for human review.',
    type: AiAnnotationSuggestionDto,
    isArray: true,
  })
  suggestions!: AiAnnotationSuggestionDto[];

  @ApiProperty({
    description: 'Bounded prompt context counts used for this suggestion run.',
    type: AiContextStatsDto,
    required: false,
  })
  contextStats?: AiContextStatsDto;
}
