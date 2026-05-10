import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RuleSource,
  type CreateOperationalRuleRequest,
  type OperationalRule,
} from '@task-mind/shared';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class RulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(
    workspaceId: string,
    createRule: CreateOperationalRuleRequest,
  ): Promise<OperationalRule> {
    const workspace = await this.workspacesService.findOne(workspaceId);
    const title = createRule.title.trim();
    const ruleText = createRule.ruleText.trim();

    if (!title) {
      throw new BadRequestException('Rule title is required.');
    }

    if (!ruleText) {
      throw new BadRequestException('Rule text is required.');
    }

    const rule = await this.prisma.operationalRule.create({
      data: {
        workspaceId: workspace.id,
        title,
        ruleText,
        category: createRule.category,
        source: RuleSource.HUMAN,
        confidence: 1,
      },
    });

    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId: workspace.id,
        eventType: 'RULE_CREATED',
        payloadJson: {
          ruleId: rule.id,
          title: rule.title,
          category: rule.category,
        },
      },
    });

    return this.toOperationalRule(rule);
  }

  async findByWorkspace(workspaceId: string): Promise<OperationalRule[]> {
    await this.workspacesService.findOne(workspaceId);

    const rules = await this.prisma.operationalRule.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return rules.map((rule) => this.toOperationalRule(rule));
  }

  async findOne(ruleId: string): Promise<OperationalRule> {
    const rule = await this.prisma.operationalRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new NotFoundException(`Rule ${ruleId} was not found.`);
    }

    return this.toOperationalRule(rule);
  }

  async remove(ruleId: string): Promise<void> {
    const rule = await this.prisma.operationalRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new NotFoundException(`Rule ${ruleId} was not found.`);
    }

    await this.prisma.$transaction([
      this.prisma.feedbackEvent.create({
        data: {
          workspaceId: rule.workspaceId,
          eventType: 'RULE_DELETED',
          payloadJson: {
            ruleId: rule.id,
            title: rule.title,
            category: rule.category,
          },
        },
      }),
      this.prisma.operationalRule.delete({ where: { id: ruleId } }),
    ]);
  }

  private toOperationalRule(rule: {
    id: string;
    workspaceId: string;
    title: string;
    ruleText: string;
    category: OperationalRule['category'];
    source: OperationalRule['source'];
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
  }): OperationalRule {
    return {
      id: rule.id,
      workspaceId: rule.workspaceId,
      title: rule.title,
      ruleText: rule.ruleText,
      category: rule.category,
      source: rule.source,
      confidence: rule.confidence,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    };
  }
}
