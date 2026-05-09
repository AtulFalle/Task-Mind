import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudioType, type Workspace } from '@task-mind/shared';

export class WorkspaceDto implements Workspace {
  @ApiProperty({
    description: 'Unique workspace identifier.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  id!: string;

  @ApiProperty({
    description: 'Human-readable workspace name.',
    example: 'Invoice Extraction Training',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Short note describing the workspace purpose.',
    example: 'Workspace for teaching invoice field extraction rules.',
  })
  description?: string;

  @ApiProperty({
    description: 'Studio workflow type.',
    enum: StudioType,
    example: StudioType.DOCUMENT,
  })
  studioType!: StudioType;

  @ApiProperty({
    description: 'ISO timestamp for when the workspace was created.',
    example: '2026-05-09T20:21:24.248Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'ISO timestamp for when the workspace was last updated.',
    example: '2026-05-09T20:21:24.248Z',
  })
  updatedAt!: string;
}
