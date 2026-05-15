import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  AiAnnotationSuggestionsResponse,
  AiSuggestionRequest,
  AiSuggestion,
  RejectAiSuggestionRequest,
  UpdateAiSuggestionRequest,
} from '@task-mind/shared';
import { AiAnnotationSuggestionsResponseDto } from './dto/ai-annotation-suggestions-response.dto';
import { AiAnnotationSuggestionDto } from './dto/ai-annotation-suggestion.dto';
import { AiSuggestionRequestDto } from './dto/ai-suggestion-request.dto';
import { RejectAiSuggestionDto } from './dto/reject-ai-suggestion.dto';
import { UpdateAiSuggestionDto } from './dto/update-ai-suggestion.dto';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('documents/:documentId/ai-suggestions')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  @ApiOperation({
    summary: 'Ask TaskMindAI for document suggestions',
  })
  @ApiBody({ type: AiSuggestionRequestDto })
  @ApiParam({
    name: 'documentId',
    description: 'Document id.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @ApiOkResponse({
    description: 'AI suggestions generated for human review.',
    type: AiAnnotationSuggestionsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Document text is not ready for suggestions.',
  })
  @ApiNotFoundResponse({ description: 'Document was not found.' })
  @ApiServiceUnavailableResponse({
    description: 'AI service or local Ollama model is unavailable.',
  })
  suggest(
    @Param('documentId') documentId: string,
    @Body() request: AiSuggestionRequest,
  ): Promise<AiAnnotationSuggestionsResponse> {
    return this.aiService.suggest(documentId, request);
  }

  @Get()
  @ApiOperation({ summary: 'List persisted AI suggestions for a document' })
  @ApiParam({
    name: 'documentId',
    description: 'Document id.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @ApiOkResponse({
    description: 'Persisted AI suggestions for the document.',
    type: AiAnnotationSuggestionDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Document was not found.' })
  findByDocument(
    @Param('documentId') documentId: string,
  ): Promise<AiSuggestion[]> {
    return this.aiService.findByDocument(documentId);
  }
}

@ApiTags('ai')
@Controller('ai-suggestions/:suggestionId')
export class AiSuggestionReviewController {
  constructor(private readonly aiService: AiService) {}

  @Patch('approve')
  @ApiOperation({ summary: 'Approve an AI suggestion' })
  @ApiParam({
    name: 'suggestionId',
    description: 'AI suggestion id.',
    example: 'c3f2f6c1-0bd8-4430-a5a1-4d4f6f0a4b5e',
  })
  @ApiOkResponse({
    description: 'Suggestion approved and feedback event recorded.',
    type: AiAnnotationSuggestionDto,
  })
  @ApiNotFoundResponse({ description: 'AI suggestion was not found.' })
  approve(@Param('suggestionId') suggestionId: string): Promise<AiSuggestion> {
    return this.aiService.approve(suggestionId);
  }

  @Patch('reject')
  @ApiOperation({ summary: 'Reject an AI suggestion' })
  @ApiParam({
    name: 'suggestionId',
    description: 'AI suggestion id.',
    example: 'c3f2f6c1-0bd8-4430-a5a1-4d4f6f0a4b5e',
  })
  @ApiBody({ type: RejectAiSuggestionDto })
  @ApiOkResponse({
    description: 'Suggestion rejected and feedback event recorded.',
    type: AiAnnotationSuggestionDto,
  })
  @ApiNotFoundResponse({ description: 'AI suggestion was not found.' })
  reject(
    @Param('suggestionId') suggestionId: string,
    @Body() request: RejectAiSuggestionRequest,
  ): Promise<AiSuggestion> {
    return this.aiService.reject(suggestionId, request);
  }

  @Patch('edit')
  @ApiOperation({ summary: 'Save a human correction for an AI suggestion' })
  @ApiParam({
    name: 'suggestionId',
    description: 'AI suggestion id.',
    example: 'c3f2f6c1-0bd8-4430-a5a1-4d4f6f0a4b5e',
  })
  @ApiBody({ type: UpdateAiSuggestionDto })
  @ApiOkResponse({
    description: 'Suggestion corrected and feedback event recorded.',
    type: AiAnnotationSuggestionDto,
  })
  @ApiBadRequestResponse({ description: 'Correction fields are invalid.' })
  @ApiNotFoundResponse({ description: 'AI suggestion was not found.' })
  edit(
    @Param('suggestionId') suggestionId: string,
    @Body() request: UpdateAiSuggestionRequest,
  ): Promise<AiSuggestion> {
    return this.aiService.edit(suggestionId, request);
  }

  @Post('convert-to-annotation')
  @ApiOperation({ summary: 'Convert an AI suggestion to an annotation' })
  @ApiParam({
    name: 'suggestionId',
    description: 'AI suggestion id.',
    example: 'c3f2f6c1-0bd8-4430-a5a1-4d4f6f0a4b5e',
  })
  @ApiOkResponse({
    description: 'Suggestion converted to an annotation.',
    type: AiAnnotationSuggestionDto,
  })
  @ApiBadRequestResponse({ description: 'Suggestion cannot be converted.' })
  @ApiNotFoundResponse({ description: 'AI suggestion was not found.' })
  convertToAnnotation(
    @Param('suggestionId') suggestionId: string,
  ): Promise<AiSuggestion> {
    return this.aiService.convertToAnnotation(suggestionId);
  }
}
