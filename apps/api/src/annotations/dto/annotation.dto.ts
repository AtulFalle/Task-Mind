import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Annotation } from '@task-mind/shared';

export class AnnotationDto implements Annotation {
  @ApiProperty({
    description: 'Unique annotation identifier.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  id!: string;

  @ApiProperty({
    description: 'Document that owns this annotation.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  documentId!: string;

  @ApiProperty({
    description: 'Workspace that owns this annotation.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  workspaceId!: string;

  @ApiProperty({
    description: 'Field name the selected text teaches.',
    example: 'invoiceNumber',
  })
  fieldName!: string;

  @ApiProperty({
    description: 'Exact selected extracted text.',
    example: 'INV-1001',
  })
  selectedText!: string;

  @ApiPropertyOptional({
    description: 'Human explanation for why this selected text matters.',
    example: 'This is the invoice identifier printed near the top of the page.',
  })
  explanation?: string;

  @ApiPropertyOptional({
    description: 'Optional start character offset in extracted text.',
    example: 42,
  })
  startOffset?: number;

  @ApiPropertyOptional({
    description: 'Optional end character offset in extracted text.',
    example: 50,
  })
  endOffset?: number;

  @ApiProperty({
    description: 'ISO timestamp for when the annotation was created.',
    example: '2026-05-10T10:15:20.085Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'ISO timestamp for when the annotation was last updated.',
    example: '2026-05-10T10:15:20.085Z',
  })
  updatedAt!: string;
}
