import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Workspace } from '@task-mind/shared';
import type { WorkspaceValidationMetrics } from '@task-mind/shared';
import type { WorkspaceValidationReadiness } from '@task-mind/shared';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceValidationMetricsDto } from './dto/workspace-validation-metrics.dto';
import { WorkspaceValidationReadinessDto } from './dto/workspace-validation-readiness.dto';
import { WorkspaceDto } from './dto/workspace.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('workspaces')
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a Document Studio workspace' })
  @ApiBody({ type: CreateWorkspaceDto })
  @ApiCreatedResponse({
    description: 'Workspace created.',
    type: WorkspaceDto,
  })
  create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    return this.workspacesService.create(createWorkspaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List workspaces' })
  @ApiOkResponse({
    description: 'Workspaces ordered newest first.',
    type: WorkspaceDto,
    isArray: true,
  })
  findAll(): Promise<Workspace[]> {
    return this.workspacesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workspace by id' })
  @ApiParam({
    name: 'id',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiOkResponse({
    description: 'Workspace found.',
    type: WorkspaceDto,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  findOne(@Param('id') id: string): Promise<Workspace> {
    return this.workspacesService.findOne(id);
  }

  @Get(':workspaceId/validation-metrics')
  @ApiOperation({
    summary: 'Get validation metrics for human-reviewed AI suggestions',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiOkResponse({
    description: 'Basic validation metrics for the workspace.',
    type: WorkspaceValidationMetricsDto,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  getValidationMetrics(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceValidationMetrics> {
    return this.workspacesService.getValidationMetrics(workspaceId);
  }

  @Get(':workspaceId/validation-readiness')
  @ApiOperation({
    summary: 'Get readiness checks for the manual validation flow',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiOkResponse({
    description: 'Readiness checks and latest AI context evidence.',
    type: WorkspaceValidationReadinessDto,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  getValidationReadiness(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceValidationReadiness> {
    return this.workspacesService.getValidationReadiness(workspaceId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a workspace' })
  @ApiParam({
    name: 'id',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiBody({ type: UpdateWorkspaceDto })
  @ApiOkResponse({
    description: 'Workspace updated.',
    type: WorkspaceDto,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    return this.workspacesService.update(id, updateWorkspaceDto);
  }
}
