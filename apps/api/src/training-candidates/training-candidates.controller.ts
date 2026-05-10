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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { TrainingCandidate } from '@task-mind/shared';
import { CreateTrainingCandidateDto } from './dto/create-training-candidate.dto';
import { TrainingCandidateDto } from './dto/training-candidate.dto';
import { UpdateTrainingCandidateDto } from './dto/update-training-candidate.dto';
import { TrainingCandidatesService } from './training-candidates.service';

@ApiTags('training-candidates')
@Controller()
export class TrainingCandidatesController {
  constructor(
    private readonly trainingCandidatesService: TrainingCandidatesService,
  ) {}

  @Post('workspaces/:workspaceId/training-candidates')
  @ApiOperation({ summary: 'Create a training candidate for a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiBody({ type: CreateTrainingCandidateDto })
  @ApiCreatedResponse({
    description: 'Training candidate created.',
    type: TrainingCandidateDto,
  })
  @ApiBadRequestResponse({
    description:
      'Required fields were missing or source document/annotation belongs to another workspace.',
  })
  @ApiNotFoundResponse({
    description: 'Workspace, document, or annotation was not found.',
  })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createCandidateDto: CreateTrainingCandidateDto,
  ): Promise<TrainingCandidate> {
    return this.trainingCandidatesService.create(
      workspaceId,
      createCandidateDto,
    );
  }

  @Get('workspaces/:workspaceId/training-candidates')
  @ApiOperation({ summary: 'List training candidates for a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiOkResponse({
    description: 'Training candidates ordered newest first.',
    type: TrainingCandidateDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  findByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<TrainingCandidate[]> {
    return this.trainingCandidatesService.findByWorkspace(workspaceId);
  }

  @Post('annotations/:annotationId/training-candidate')
  @ApiOperation({
    summary: 'Create a draft training candidate from an annotation',
  })
  @ApiParam({
    name: 'annotationId',
    description: 'Annotation id.',
    example: 'a5c23419-866a-46aa-9d7e-bff2e5a645bd',
  })
  @ApiCreatedResponse({
    description: 'Draft training candidate created from annotation.',
    type: TrainingCandidateDto,
  })
  @ApiNotFoundResponse({ description: 'Annotation was not found.' })
  createFromAnnotation(
    @Param('annotationId') annotationId: string,
  ): Promise<TrainingCandidate> {
    return this.trainingCandidatesService.createDraftFromAnnotation(
      annotationId,
    );
  }

  @Get('training-candidates/:candidateId')
  @ApiOperation({ summary: 'Get a training candidate by id' })
  @ApiParam({
    name: 'candidateId',
    description: 'Training candidate id.',
    example: '79d25dd8-6164-4d1c-9f2c-115778231375',
  })
  @ApiOkResponse({
    description: 'Training candidate found.',
    type: TrainingCandidateDto,
  })
  @ApiNotFoundResponse({ description: 'Training candidate was not found.' })
  findOne(
    @Param('candidateId') candidateId: string,
  ): Promise<TrainingCandidate> {
    return this.trainingCandidatesService.findOne(candidateId);
  }

  @Patch('training-candidates/:candidateId')
  @ApiOperation({ summary: 'Update a training candidate' })
  @ApiParam({
    name: 'candidateId',
    description: 'Training candidate id.',
    example: '79d25dd8-6164-4d1c-9f2c-115778231375',
  })
  @ApiBody({ type: UpdateTrainingCandidateDto })
  @ApiOkResponse({
    description: 'Training candidate updated.',
    type: TrainingCandidateDto,
  })
  @ApiBadRequestResponse({ description: 'Required text fields were empty.' })
  @ApiNotFoundResponse({ description: 'Training candidate was not found.' })
  update(
    @Param('candidateId') candidateId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateCandidateDto: UpdateTrainingCandidateDto,
  ): Promise<TrainingCandidate> {
    return this.trainingCandidatesService.update(
      candidateId,
      updateCandidateDto,
    );
  }

  @Delete('training-candidates/:candidateId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a training candidate' })
  @ApiParam({
    name: 'candidateId',
    description: 'Training candidate id.',
    example: '79d25dd8-6164-4d1c-9f2c-115778231375',
  })
  @ApiNoContentResponse({ description: 'Training candidate deleted.' })
  @ApiNotFoundResponse({ description: 'Training candidate was not found.' })
  remove(@Param('candidateId') candidateId: string): Promise<void> {
    return this.trainingCandidatesService.remove(candidateId);
  }
}
