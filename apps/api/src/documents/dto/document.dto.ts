import { ApiProperty } from '@nestjs/swagger';
import {
  DocumentStatus,
  ExtractedTextStatus,
  type Document,
} from '@task-mind/shared';

export class DocumentDto implements Document {
  @ApiProperty({
    description: 'Unique document identifier.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  id!: string;

  @ApiProperty({
    description: 'Workspace that owns the document.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  workspaceId!: string;

  @ApiProperty({
    description: 'Original uploaded file name.',
    example: 'invoice-sample.pdf',
  })
  originalName!: string;

  @ApiProperty({
    description: 'Stored file name.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b.pdf',
  })
  fileName!: string;

  @ApiProperty({
    description: 'Uploaded file MIME type.',
    example: 'application/pdf',
  })
  mimeType!: string;

  @ApiProperty({
    description: 'Uploaded file size in bytes.',
    example: 24576,
  })
  size!: number;

  @ApiProperty({
    description: 'Local file path where the uploaded file is stored.',
    example: 'storage/documents/25ab7e76-a1fd-443a-a803-0d0b81f6269b.pdf',
  })
  filePath!: string;

  @ApiProperty({
    description: 'Current document processing status.',
    enum: DocumentStatus,
    example: DocumentStatus.UPLOADED,
  })
  status!: DocumentStatus;

  @ApiProperty({
    description: 'Extracted plain text stored for this document.',
    nullable: true,
    example: 'Invoice #1001\nTotal: $245.00',
  })
  extractedText!: string | null;

  @ApiProperty({
    description: 'Current text extraction status.',
    enum: ExtractedTextStatus,
    example: ExtractedTextStatus.COMPLETED,
  })
  extractedTextStatus!: ExtractedTextStatus;

  @ApiProperty({
    description: 'Text extraction error when parsing failed.',
    required: false,
    example: 'Unable to parse the uploaded document.',
  })
  extractionError?: string;

  @ApiProperty({
    description: 'ISO timestamp for when the document was uploaded.',
    example: '2026-05-09T20:45:20.085Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'ISO timestamp for when the document was last updated.',
    example: '2026-05-09T20:45:20.085Z',
  })
  updatedAt!: string;
}
