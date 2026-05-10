import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  RuleSource,
  type CreateOperationalRuleRequest,
  type OperationalRule,
} from '@task-mind/shared';
import { randomUUID } from 'node:crypto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class RulesService {
  private readonly rules = new Map<string, OperationalRule>();

  constructor(private readonly workspacesService: WorkspacesService) {}

  create(
    workspaceId: string,
    createRule: CreateOperationalRuleRequest,
  ): OperationalRule {
    const workspace = this.workspacesService.findOne(workspaceId);
    const title = createRule.title.trim();
    const ruleText = createRule.ruleText.trim();

    if (!title) {
      throw new BadRequestException('Rule title is required.');
    }

    if (!ruleText) {
      throw new BadRequestException('Rule text is required.');
    }

    const now = new Date().toISOString();
    const rule: OperationalRule = {
      id: randomUUID(),
      workspaceId: workspace.id,
      title,
      ruleText,
      category: createRule.category,
      source: RuleSource.HUMAN,
      confidence: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.rules.set(rule.id, rule);

    return rule;
  }

  findByWorkspace(workspaceId: string): OperationalRule[] {
    this.workspacesService.findOne(workspaceId);

    return Array.from(this.rules.values())
      .filter((rule) => rule.workspaceId === workspaceId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  remove(ruleId: string): void {
    if (!this.rules.delete(ruleId)) {
      throw new NotFoundException(`Rule ${ruleId} was not found.`);
    }
  }
}
