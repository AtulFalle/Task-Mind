import { ApiProperty } from '@nestjs/swagger';
import type { PlaygroundClassificationRequest } from '@task-mind/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ClassifyPlaygroundMessageDto
  implements PlaygroundClassificationRequest
{
  @ApiProperty({
    description: 'Support message text to classify.',
    example: 'My card was charged twice and I need a refund today.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  inputText!: string;
}
