import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateWorkspaceRequest, Workspace } from '@task-mind/shared';
import { randomUUID } from 'node:crypto';

@Injectable()
export class WorkspacesService {
  private readonly workspaces = new Map<string, Workspace>();

  create(createWorkspace: CreateWorkspaceRequest): Workspace {
    const now = new Date().toISOString();
    const workspace: Workspace = {
      id: randomUUID(),
      name: createWorkspace.name.trim(),
      description: createWorkspace.description?.trim() || undefined,
      studioType: createWorkspace.studioType,
      createdAt: now,
      updatedAt: now,
    };

    this.workspaces.set(workspace.id, workspace);

    return workspace;
  }

  findAll(): Workspace[] {
    return Array.from(this.workspaces.values()).sort((first, second) =>
      second.createdAt.localeCompare(first.createdAt),
    );
  }

  findOne(id: string): Workspace {
    const workspace = this.workspaces.get(id);

    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} was not found.`);
    }

    return workspace;
  }
}
