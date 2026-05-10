import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import type { OperationalRule } from '@task-mind/shared';
import { CreateOperationalRuleDto } from './dto/create-operational-rule.dto';
import { OperationalRuleDto } from './dto/operational-rule.dto';
import { RulesService } from './rules.service';

@ApiTags('rules')
@Controller()
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post('workspaces/:workspaceId/rules')
  @ApiOperation({ summary: 'Create an operational rule for a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiBody({ type: CreateOperationalRuleDto })
  @ApiCreatedResponse({
    description: 'Operational rule created.',
    type: OperationalRuleDto,
  })
  @ApiBadRequestResponse({
    description: 'Title, rule text, or category was missing.',
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createRuleDto: CreateOperationalRuleDto,
  ): OperationalRule {
    return this.rulesService.create(workspaceId, createRuleDto);
  }

  @Get('workspaces/:workspaceId/rules')
  @ApiOperation({ summary: 'List operational rules for a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiOkResponse({
    description: 'Operational rules ordered newest first.',
    type: OperationalRuleDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  findByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): OperationalRule[] {
    return this.rulesService.findByWorkspace(workspaceId);
  }

  @Delete('rules/:ruleId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an operational rule' })
  @ApiParam({
    name: 'ruleId',
    description: 'Operational rule id.',
    example: '3f64d20c-ae9a-4c06-bb62-b71f65d10c75',
  })
  @ApiNoContentResponse({ description: 'Operational rule deleted.' })
  @ApiNotFoundResponse({ description: 'Operational rule was not found.' })
  remove(@Param('ruleId') ruleId: string): void {
    this.rulesService.remove(ruleId);
  }
}
