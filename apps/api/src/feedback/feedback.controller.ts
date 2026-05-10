import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { FeedbackEvent } from '@task-mind/shared';
import { FeedbackEventDto } from './dto/feedback-event.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('workspaces/:workspaceId/feedback-events')
  @ApiOperation({ summary: 'List teaching memory events for a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiOkResponse({
    description: 'Feedback events ordered newest first.',
    type: FeedbackEventDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  findByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<FeedbackEvent[]> {
    return this.feedbackService.findByWorkspace(workspaceId);
  }

  @Get('documents/:documentId/feedback-events')
  @ApiOperation({ summary: 'List teaching memory events for a document' })
  @ApiParam({
    name: 'documentId',
    description: 'Document id.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @ApiOkResponse({
    description: 'Feedback events ordered newest first.',
    type: FeedbackEventDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Document was not found.' })
  findByDocument(
    @Param('documentId') documentId: string,
  ): Promise<FeedbackEvent[]> {
    return this.feedbackService.findByDocument(documentId);
  }
}
