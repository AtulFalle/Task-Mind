import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackEventType, type FeedbackEvent } from '@task-mind/shared';

export class FeedbackEventDto implements FeedbackEvent {
  @ApiProperty({
    description: 'Unique feedback event identifier.',
    example: 'ecf5a37c-e2d4-4d60-b6f0-377edbbec6e6',
  })
  id!: string;

  @ApiProperty({
    description: 'Workspace that owns this teaching memory event.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  workspaceId!: string;

  @ApiPropertyOptional({
    description: 'Document associated with this event, when applicable.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  documentId?: string;

  @ApiPropertyOptional({
    description: 'Annotation associated with this event, when applicable.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  annotationId?: string;

  @ApiProperty({
    description: 'Type of teaching memory event.',
    enum: FeedbackEventType,
    example: FeedbackEventType.ANNOTATION_CREATED,
  })
  eventType!: FeedbackEventType;

  @ApiProperty({
    description: 'Event-specific teaching memory payload.',
    example: {
      fieldName: 'invoiceNumber',
      selectedText: 'INV-1001',
    },
  })
  payloadJson!: Record<string, unknown>;

  @ApiProperty({
    description: 'ISO timestamp for when the event was created.',
    example: '2026-05-10T10:15:20.085Z',
  })
  createdAt!: string;
}
