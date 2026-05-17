import { ApiProperty } from '@nestjs/swagger';
import {
  PlaygroundIntent,
  PlaygroundPriority,
  type PlaygroundCorrectionRequest,
} from '@task-mind/shared';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CorrectPlaygroundExampleDto
  implements PlaygroundCorrectionRequest
{
  @ApiProperty({
    description: 'Human-corrected message intent.',
    enum: PlaygroundIntent,
    example: PlaygroundIntent.BILLING,
  })
  @IsEnum(PlaygroundIntent)
  finalIntent!: PlaygroundIntent;

  @ApiProperty({
    description: 'Human-corrected priority.',
    enum: PlaygroundPriority,
    example: PlaygroundPriority.HIGH,
  })
  @IsEnum(PlaygroundPriority)
  finalPriority!: PlaygroundPriority;

  @ApiProperty({
    description: 'Reason this correction should be reused as teaching memory.',
    example: 'Refund and failed payment language should be treated as billing.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  correctionReason!: string;
}
