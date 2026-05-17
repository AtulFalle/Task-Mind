import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PlaygroundExampleStatus,
  PlaygroundIntent,
  PlaygroundPriority,
  type PlaygroundExample,
} from '@task-mind/shared';

export class PlaygroundExampleDto implements PlaygroundExample {
  @ApiProperty({ description: 'Unique playground example id.' })
  id!: string;

  @ApiProperty({ description: 'Workspace that owns this example.' })
  workspaceId!: string;

  @ApiProperty({ description: 'Original message entered by the user.' })
  inputText!: string;

  @ApiProperty({ enum: PlaygroundIntent })
  predictedIntent!: PlaygroundIntent;

  @ApiProperty({ enum: PlaygroundPriority })
  predictedPriority!: PlaygroundPriority;

  @ApiProperty({ description: 'Short AI reasoning for the prediction.' })
  predictedReasoning!: string;

  @ApiProperty({ description: 'Prediction confidence between 0 and 1.' })
  predictedConfidence!: number;

  @ApiPropertyOptional({ enum: PlaygroundIntent })
  finalIntent?: PlaygroundIntent;

  @ApiPropertyOptional({ enum: PlaygroundPriority })
  finalPriority?: PlaygroundPriority;

  @ApiPropertyOptional({ description: 'Human explanation for a correction.' })
  correctionReason?: string;

  @ApiProperty({ enum: PlaygroundExampleStatus })
  status!: PlaygroundExampleStatus;

  @ApiProperty({ description: 'ISO creation timestamp.' })
  createdAt!: string;

  @ApiProperty({ description: 'ISO update timestamp.' })
  updatedAt!: string;
}
