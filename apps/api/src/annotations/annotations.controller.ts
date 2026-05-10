import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Annotation } from '@task-mind/shared';
import { AnnotationsService } from './annotations.service';
import { AnnotationDto } from './dto/annotation.dto';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
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
  ): Annotation {
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
  findByDocument(@Param('documentId') documentId: string): Annotation[] {
    return this.annotationsService.findByDocument(documentId);
  }

  @Put('annotations/:annotationId')
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
    description: 'Field name or selected text was missing.',
  })
  @ApiNotFoundResponse({ description: 'Annotation was not found.' })
  update(
    @Param('annotationId') annotationId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateAnnotationDto: UpdateAnnotationDto,
  ): Annotation {
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
  remove(@Param('annotationId') annotationId: string): void {
    this.annotationsService.remove(annotationId);
  }
}
