import { ApiProperty } from '@nestjs/swagger';
import {
  PlaygroundIntent,
  PlaygroundPriority,
  type AiContextStats,
  type PlaygroundClassificationResponse,
} from '@task-mind/shared';

class PlaygroundContextStatsDto implements AiContextStats {
  @ApiProperty({ example: 3 })
  rulesUsed!: number;

  @ApiProperty({ example: 4 })
  approvedExamplesUsed!: number;

  @ApiProperty({ example: 6 })
  correctedExamplesUsed!: number;

  @ApiProperty({ example: 1 })
  rejectedExamplesUsed!: number;
}

export class PlaygroundClassificationResponseDto
  implements PlaygroundClassificationResponse
{
  @ApiProperty({ description: 'Persisted playground example id.' })
  exampleId!: string;

  @ApiProperty({ enum: PlaygroundIntent })
  intent!: PlaygroundIntent;

  @ApiProperty({ enum: PlaygroundPriority })
  priority!: PlaygroundPriority;

  @ApiProperty({ description: 'Short model reasoning.' })
  reasoning!: string;

  @ApiProperty({ description: 'Prediction confidence between 0 and 1.' })
  confidence!: number;

  @ApiProperty({ type: PlaygroundContextStatsDto })
  contextStats!: AiContextStats;
}
