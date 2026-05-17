import { ApiProperty } from '@nestjs/swagger';
import type { PlaygroundMetrics } from '@task-mind/shared';

export class PlaygroundMetricsDto implements PlaygroundMetrics {
  @ApiProperty({ description: 'Workspace id.' })
  workspaceId!: string;

  @ApiProperty({ example: 20 })
  totalPredictions!: number;

  @ApiProperty({ example: 14 })
  approved!: number;

  @ApiProperty({ example: 6 })
  corrected!: number;

  @ApiProperty({ example: 0.3 })
  correctionRate!: number;
}
