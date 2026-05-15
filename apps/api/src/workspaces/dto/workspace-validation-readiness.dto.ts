import { ApiProperty } from '@nestjs/swagger';
import type {
  AiContextStats,
  WorkspaceValidationReadiness,
} from '@task-mind/shared';

class WorkspaceValidationContextStatsDto implements AiContextStats {
  @ApiProperty({ description: 'Operational rules included in the latest AI context.', example: 2 })
  rulesUsed!: number;

  @ApiProperty({ description: 'Approved examples included in the latest AI context.', example: 1 })
  approvedExamplesUsed!: number;

  @ApiProperty({ description: 'Corrected examples included in the latest AI context.', example: 1 })
  correctedExamplesUsed!: number;

  @ApiProperty({ description: 'Rejected examples included in the latest AI context.', example: 0 })
  rejectedExamplesUsed!: number;
}

export class WorkspaceValidationReadinessDto
  implements WorkspaceValidationReadiness
{
  @ApiProperty({ description: 'Workspace has at least one uploaded document.' })
  hasDocuments!: boolean;

  @ApiProperty({ description: 'Workspace has at least one operational rule.' })
  hasRules!: boolean;

  @ApiProperty({ description: 'Workspace has at least one AI suggestion.' })
  hasAiSuggestions!: boolean;

  @ApiProperty({ description: 'Workspace has at least one human feedback event.' })
  hasHumanFeedback!: boolean;

  @ApiProperty({ description: 'Configured AI service health check succeeded.' })
  aiServiceReachable!: boolean;

  @ApiProperty({
    description: 'Context summary from the latest classification AI suggestion.',
    type: WorkspaceValidationContextStatsDto,
  })
  latestContextStats!: WorkspaceValidationContextStatsDto;
}
