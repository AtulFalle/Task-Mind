import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentStatus, type Document } from '@task-mind/shared';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { WorkspacesService } from '../workspaces/workspaces.service';

const DOCUMENT_STORAGE_DIR = resolve(process.cwd(), 'storage', 'documents');
const STORAGE_PATH_PREFIX = join('storage', 'documents');

@Injectable()
export class DocumentsService {
  private readonly documents = new Map<string, Document>();

  constructor(private readonly workspacesService: WorkspacesService) {}

  async upload(
    workspaceId: string,
    file: Express.Multer.File | undefined,
  ): Promise<Document> {
    this.workspacesService.findOne(workspaceId);

    if (!file) {
      throw new BadRequestException('A document file is required.');
    }

    await mkdir(DOCUMENT_STORAGE_DIR, { recursive: true });

    const id = randomUUID();
    const fileName = `${id}${this.getSafeExtension(file.originalname)}`;
    const absoluteFilePath = join(DOCUMENT_STORAGE_DIR, fileName);

    await writeFile(absoluteFilePath, file.buffer);

    const now = new Date().toISOString();
    const document: Document = {
      id,
      workspaceId,
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      filePath: join(STORAGE_PATH_PREFIX, fileName),
      status: DocumentStatus.UPLOADED,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(document.id, document);

    return document;
  }

  findByWorkspace(workspaceId: string): Document[] {
    this.workspacesService.findOne(workspaceId);

    return Array.from(this.documents.values())
      .filter((document) => document.workspaceId === workspaceId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  findOne(documentId: string): Document {
    const document = this.documents.get(documentId);

    if (!document) {
      throw new NotFoundException(`Document ${documentId} was not found.`);
    }

    return document;
  }

  private getSafeExtension(originalName: string): string {
    const extension = extname(originalName).toLowerCase();
    return extension || '.bin';
  }
}
