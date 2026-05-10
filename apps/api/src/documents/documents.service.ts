import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentStatus,
  ExtractedTextStatus,
  type Document,
  type DocumentTextResponse,
} from '@task-mind/shared';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { DocumentTextParserService } from './document-text-parser.service';

const DOCUMENT_STORAGE_DIR = resolve(process.cwd(), 'storage', 'documents');
const STORAGE_PATH_PREFIX = join('storage', 'documents');

@Injectable()
export class DocumentsService {
  private readonly documents = new Map<string, Document>();

  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly documentTextParserService: DocumentTextParserService,
  ) {}

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
      extractedText: null,
      extractedTextStatus: ExtractedTextStatus.NOT_STARTED,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(document.id, document);
    await this.extractText(document, absoluteFilePath);

    return this.findOne(document.id);
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

  getText(documentId: string): DocumentTextResponse {
    const document = this.findOne(documentId);

    return {
      documentId: document.id,
      status: document.extractedTextStatus,
      text: document.extractedText,
      ...(document.extractionError ? { error: document.extractionError } : {}),
    };
  }

  private async extractText(
    document: Document,
    absoluteFilePath: string,
  ): Promise<void> {
    this.updateExtraction(document, {
      extractedTextStatus: ExtractedTextStatus.PROCESSING,
      extractionError: undefined,
    });

    try {
      const parsedText = await this.documentTextParserService.parse(
        absoluteFilePath,
        document.mimeType,
      );

      this.updateExtraction(document, {
        extractedText: parsedText.text,
        extractedTextStatus: parsedText.status,
        extractionError: parsedText.error,
        status:
          parsedText.status === ExtractedTextStatus.COMPLETED
            ? DocumentStatus.PARSED
            : document.status,
      });
    } catch (error) {
      this.updateExtraction(document, {
        extractedText: null,
        extractedTextStatus: ExtractedTextStatus.FAILED,
        extractionError:
          error instanceof Error
            ? error.message
            : 'Unable to parse the uploaded document.',
        status: DocumentStatus.FAILED,
      });
    }
  }

  private updateExtraction(
    document: Document,
    update: Partial<
      Pick<
        Document,
        | 'extractedText'
        | 'extractedTextStatus'
        | 'extractionError'
        | 'status'
        | 'updatedAt'
      >
    >,
  ): void {
    const updatedDocument: Document = {
      ...document,
      ...update,
      updatedAt: new Date().toISOString(),
    };

    this.documents.set(document.id, updatedDocument);
  }

  private getSafeExtension(originalName: string): string {
    const extension = extname(originalName).toLowerCase();
    return extension || '.bin';
  }
}
