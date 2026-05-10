import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Annotation, LinkedOperationalRule } from '@task-mind/shared';
import { AnnotationsService } from './annotations.service';
import { AnnotationDto } from './dto/annotation.dto';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { LinkedOperationalRuleDto } from './dto/linked-operational-rule.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

@ApiTags('annotations')
@Controller()
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post('documents/:documentId/annotations')
  @ApiOperation({ summary: 'Create a teaching annotation for a document' })
  @ApiParam({
    name: 'documentId',
    description: 'Document id.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @ApiBody({ type: CreateAnnotationDto })
  @ApiCreatedResponse({
    description: 'Annotation created.',
    type: AnnotationDto,
  })
  @ApiBadRequestResponse({
    description: 'Field name or selected text was missing.',
  })
  @ApiNotFoundResponse({ description: 'Document was not found.' })
  create(
    @Param('documentId') documentId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createAnnotationDto: CreateAnnotationDto,
  ): Promise<Annotation> {
    return this.annotationsService.create(documentId, createAnnotationDto);
  }

  @Get('documents/:documentId/annotations')
  @ApiOperation({ summary: 'List teaching annotations for a document' })
  @ApiParam({
    name: 'documentId',
    description: 'Document id.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @ApiOkResponse({
    description: 'Annotations ordered newest first.',
    type: AnnotationDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Document was not found.' })
  findByDocument(
    @Param('documentId') documentId: string,
  ): Promise<Annotation[]> {
    return this.annotationsService.findByDocument(documentId);
  }

  @Post('annotations/:annotationId/rules/:ruleId')
  @ApiOperation({ summary: 'Link an operational rule to an annotation' })
  @ApiParam({
    name: 'annotationId',
    description: 'Annotation id.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  @ApiParam({
    name: 'ruleId',
    description: 'Operational rule id.',
    example: '3f64d20c-ae9a-4c06-bb62-b71f65d10c75',
  })
  @ApiCreatedResponse({
    description: 'Operational rule linked to annotation.',
    type: LinkedOperationalRuleDto,
  })
  @ApiBadRequestResponse({
    description: 'Annotation and rule belong to different workspaces.',
  })
  @ApiConflictResponse({
    description: 'Rule is already linked to this annotation.',
  })
  @ApiNotFoundResponse({ description: 'Annotation or rule was not found.' })
  linkRule(
    @Param('annotationId') annotationId: string,
    @Param('ruleId') ruleId: string,
  ): Promise<LinkedOperationalRule> {
    return this.annotationsService.linkRule(annotationId, ruleId);
  }

  @Delete('annotations/:annotationId/rules/:ruleId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Unlink an operational rule from an annotation' })
  @ApiParam({
    name: 'annotationId',
    description: 'Annotation id.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  @ApiParam({
    name: 'ruleId',
    description: 'Operational rule id.',
    example: '3f64d20c-ae9a-4c06-bb62-b71f65d10c75',
  })
  @ApiNoContentResponse({ description: 'Operational rule unlinked.' })
  @ApiBadRequestResponse({
    description: 'Annotation and rule belong to different workspaces.',
  })
  @ApiNotFoundResponse({
    description: 'Annotation, rule, or annotation-rule link was not found.',
  })
  unlinkRule(
    @Param('annotationId') annotationId: string,
    @Param('ruleId') ruleId: string,
  ): Promise<void> {
    return this.annotationsService.unlinkRule(annotationId, ruleId);
  }

  @Get('annotations/:annotationId/rules')
  @ApiOperation({ summary: 'List operational rules linked to an annotation' })
  @ApiParam({
    name: 'annotationId',
    description: 'Annotation id.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  @ApiOkResponse({
    description: 'Linked operational rules ordered newest first.',
    type: LinkedOperationalRuleDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Annotation was not found.' })
  findLinkedRules(
    @Param('annotationId') annotationId: string,
  ): Promise<LinkedOperationalRule[]> {
    return this.annotationsService.findLinkedRules(annotationId);
  }

  @Patch('annotations/:annotationId')
  @ApiOperation({ summary: 'Update a teaching annotation' })
  @ApiParam({
    name: 'annotationId',
    description: 'Annotation id.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  @ApiBody({ type: UpdateAnnotationDto })
  @ApiOkResponse({
    description: 'Annotation updated.',
    type: AnnotationDto,
  })
  @ApiBadRequestResponse({
    description: 'Field name was missing.',
  })
  @ApiNotFoundResponse({ description: 'Annotation was not found.' })
  update(
    @Param('annotationId') annotationId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateAnnotationDto: UpdateAnnotationDto,
  ): Promise<Annotation> {
    return this.annotationsService.update(annotationId, updateAnnotationDto);
  }

  @Delete('annotations/:annotationId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a teaching annotation' })
  @ApiParam({
    name: 'annotationId',
    description: 'Annotation id.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  @ApiNoContentResponse({ description: 'Annotation deleted.' })
  @ApiNotFoundResponse({ description: 'Annotation was not found.' })
  remove(@Param('annotationId') annotationId: string): Promise<void> {
    return this.annotationsService.remove(annotationId);
  }
}
