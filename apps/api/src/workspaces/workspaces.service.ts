import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  Workspace,
} from '@task-mind/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkspace: CreateWorkspaceRequest): Promise<Workspace> {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspace.name.trim(),
        description: createWorkspace.description?.trim() || null,
        studioType: createWorkspace.studioType,
      },
    });

    return this.toWorkspace(workspace);
  }

  async findAll(): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return workspaces.map((workspace) => this.toWorkspace(workspace));
  }

  async findOne(id: string): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} was not found.`);
    }

    return this.toWorkspace(workspace);
  }

  async update(
    id: string,
    updateWorkspace: UpdateWorkspaceRequest,
  ): Promise<Workspace> {
    await this.findOne(id);

    const workspace = await this.prisma.workspace.update({
      where: { id },
      data: {
        name: updateWorkspace.name.trim(),
        description: updateWorkspace.description?.trim() || null,
        studioType: updateWorkspace.studioType,
      },
    });

    return this.toWorkspace(workspace);
  }

  private toWorkspace(workspace: {
    id: string;
    name: string;
    description: string | null;
    studioType: Workspace['studioType'];
    createdAt: Date;
    updatedAt: Date;
  }): Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || undefined,
      studioType: workspace.studioType,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }
}
