import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type {
  PlaygroundClassificationResponse,
  PlaygroundExample,
  PlaygroundMetrics,
} from '@task-mind/shared';
import { ClassifyPlaygroundMessageDto } from './dto/classify-playground-message.dto';
import { CorrectPlaygroundExampleDto } from './dto/correct-playground-example.dto';
import { PlaygroundClassificationResponseDto } from './dto/playground-classification-response.dto';
import { PlaygroundExampleDto } from './dto/playground-example.dto';
import { PlaygroundMetricsDto } from './dto/playground-metrics.dto';
import { PlaygroundService } from './playground.service';

@ApiTags('playground')
@Controller()
export class PlaygroundController {
  constructor(private readonly playgroundService: PlaygroundService) {}

  @Post('workspaces/:workspaceId/playground/classify')
  @ApiOperation({ summary: 'Classify a pasted support message' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace id.' })
  @ApiBody({ type: ClassifyPlaygroundMessageDto })
  @ApiCreatedResponse({
    description: 'Message classified and stored as a pending example.',
    type: PlaygroundClassificationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Input text was missing.' })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  classify(
    @Param('workspaceId') workspaceId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    request: ClassifyPlaygroundMessageDto,
  ): Promise<PlaygroundClassificationResponse> {
    return this.playgroundService.classify(workspaceId, request);
  }

  @Get('workspaces/:workspaceId/playground/examples')
  @ApiOperation({ summary: 'List recent playground feedback examples' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace id.' })
  @ApiOkResponse({
    description: 'Recent examples ordered newest first.',
    type: PlaygroundExampleDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  findByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<PlaygroundExample[]> {
    return this.playgroundService.findByWorkspace(workspaceId);
  }

  @Get('workspaces/:workspaceId/playground/metrics')
  @ApiOperation({ summary: 'Get lightweight playground validation metrics' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace id.' })
  @ApiOkResponse({
    description: 'Playground prediction and correction metrics.',
    type: PlaygroundMetricsDto,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  getMetrics(
    @Param('workspaceId') workspaceId: string,
  ): Promise<PlaygroundMetrics> {
    return this.playgroundService.getMetrics(workspaceId);
  }

  @Patch('playground/examples/:exampleId/approve')
  @ApiOperation({ summary: 'Approve a playground classification' })
  @ApiParam({ name: 'exampleId', description: 'Playground example id.' })
  @ApiOkResponse({
    description: 'Example approved.',
    type: PlaygroundExampleDto,
  })
  @ApiNotFoundResponse({ description: 'Example was not found.' })
  approve(@Param('exampleId') exampleId: string): Promise<PlaygroundExample> {
    return this.playgroundService.approve(exampleId);
  }

  @Patch('playground/examples/:exampleId/correct')
  @ApiOperation({ summary: 'Save human correction for a playground example' })
  @ApiParam({ name: 'exampleId', description: 'Playground example id.' })
  @ApiBody({ type: CorrectPlaygroundExampleDto })
  @ApiOkResponse({
    description: 'Correction saved.',
    type: PlaygroundExampleDto,
  })
  @ApiBadRequestResponse({ description: 'Correction fields were missing.' })
  @ApiNotFoundResponse({ description: 'Example was not found.' })
  correct(
    @Param('exampleId') exampleId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    request: CorrectPlaygroundExampleDto,
  ): Promise<PlaygroundExample> {
    return this.playgroundService.correct(exampleId, request);
  }

  @Patch('playground/examples/:exampleId/reject')
  @ApiOperation({ summary: 'Reject a playground classification' })
  @ApiParam({ name: 'exampleId', description: 'Playground example id.' })
  @ApiOkResponse({
    description: 'Example rejected.',
    type: PlaygroundExampleDto,
  })
  @ApiNotFoundResponse({ description: 'Example was not found.' })
  reject(@Param('exampleId') exampleId: string): Promise<PlaygroundExample> {
    return this.playgroundService.reject(exampleId);
  }
}
