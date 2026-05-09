import { StudioType, type CreateWorkspaceRequest } from '@task-mind/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceDto implements CreateWorkspaceRequest {
  @ApiProperty({
    description: 'Human-readable workspace name.',
    example: 'Invoice Extraction Training',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Short note describing the workspace purpose.',
    example: 'Workspace for teaching invoice field extraction rules.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Studio workflow type. MVP 0 supports Document Studio only.',
    enum: StudioType,
    example: StudioType.DOCUMENT,
  })
  @IsEnum(StudioType)
  studioType!: StudioType;
}
