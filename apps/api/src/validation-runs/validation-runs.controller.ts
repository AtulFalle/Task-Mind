import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
import type {
  AddValidationRunItemRequest,
  CreateValidationRunRequest,
  ValidationRun,
  ValidationRunItem,
} from '@task-mind/shared';
import { AddValidationRunItemDto } from './dto/add-validation-run-item.dto';
import { CreateValidationRunDto } from './dto/create-validation-run.dto';
import { ValidationRunDto, ValidationRunItemDto } from './dto/validation-run.dto';
import { ValidationRunsService } from './validation-runs.service';

@ApiTags('validation-runs')
@Controller()
export class ValidationRunsController {
  constructor(private readonly validationRunsService: ValidationRunsService) {}

  @Post('workspaces/:workspaceId/validation-runs')
  @ApiOperation({ summary: 'Create a validation run for a workspace' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace id.' })
  @ApiBody({ type: CreateValidationRunDto })
  @ApiCreatedResponse({ type: ValidationRunDto })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() request: CreateValidationRunRequest,
  ): Promise<ValidationRun> {
    return this.validationRunsService.create(workspaceId, request);
  }

  @Get('workspaces/:workspaceId/validation-runs')
  @ApiOperation({ summary: 'List validation runs for a workspace' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace id.' })
  @ApiOkResponse({ type: ValidationRunDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  findByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ValidationRun[]> {
    return this.validationRunsService.findByWorkspace(workspaceId);
  }

  @Get('validation-runs/:runId')
  @ApiOperation({ summary: 'Get validation run details' })
  @ApiParam({ name: 'runId', description: 'Validation run id.' })
  @ApiOkResponse({ type: ValidationRunDto })
  @ApiNotFoundResponse({ description: 'Validation run was not found.' })
  findOne(@Param('runId') runId: string): Promise<ValidationRun> {
    return this.validationRunsService.findOne(runId);
  }

  @Post('validation-runs/:runId/items')
  @ApiOperation({ summary: 'Attach a classification result to a validation run' })
  @ApiParam({ name: 'runId', description: 'Validation run id.' })
  @ApiBody({ type: AddValidationRunItemDto })
  @ApiCreatedResponse({ type: ValidationRunItemDto })
  @ApiBadRequestResponse({ description: 'Validation run cannot be changed.' })
  @ApiNotFoundResponse({ description: 'Validation run was not found.' })
  addItem(
    @Param('runId') runId: string,
    @Body() request: AddValidationRunItemRequest,
  ): Promise<ValidationRunItem> {
    return this.validationRunsService.addItem(runId, request);
  }

  @Patch('validation-runs/:runId/complete')
  @ApiOperation({ summary: 'Complete a validation run and calculate metrics' })
  @ApiParam({ name: 'runId', description: 'Validation run id.' })
  @ApiOkResponse({ type: ValidationRunDto })
  @ApiBadRequestResponse({ description: 'Validation run cannot be completed.' })
  @ApiNotFoundResponse({ description: 'Validation run was not found.' })
  complete(@Param('runId') runId: string): Promise<ValidationRun> {
    return this.validationRunsService.complete(runId);
  }

  @Delete('validation-runs/:runId')
  @ApiOperation({ summary: 'Delete a validation run' })
  @ApiParam({ name: 'runId', description: 'Validation run id.' })
  @ApiNoContentResponse({ description: 'Validation run deleted.' })
  @ApiNotFoundResponse({ description: 'Validation run was not found.' })
  @HttpCode(204)
  delete(@Param('runId') runId: string): Promise<void> {
    return this.validationRunsService.delete(runId);
  }
}
