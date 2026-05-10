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
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { DocumentTextParserService } from './document-text-parser.service';

const DOCUMENT_STORAGE_DIR = resolve(process.cwd(), 'storage', 'documents');
const STORAGE_PATH_PREFIX = join('storage', 'documents');

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly documentTextParserService: DocumentTextParserService,
  ) {}

  async upload(
    workspaceId: string,
    file: Express.Multer.File | undefined,
  ): Promise<Document> {
    await this.workspacesService.findOne(workspaceId);

    if (!file) {
      throw new BadRequestException('A document file is required.');
    }

    await mkdir(DOCUMENT_STORAGE_DIR, { recursive: true });

    const id = randomUUID();
    const fileName = `${id}${this.getSafeExtension(file.originalname)}`;
    const absoluteFilePath = join(DOCUMENT_STORAGE_DIR, fileName);

    await writeFile(absoluteFilePath, file.buffer);

    const document = await this.prisma.document.create({
      data: {
        id,
        workspaceId,
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        size: file.size,
        filePath: join(STORAGE_PATH_PREFIX, fileName),
        status: DocumentStatus.PARSING_PENDING,
        extractedTextStatus: ExtractedTextStatus.NOT_STARTED,
      },
    });

    await this.prisma.feedbackEvent.create({
      data: {
        workspaceId,
        documentId: document.id,
        eventType: 'DOCUMENT_UPLOADED',
        payloadJson: {
          originalName: document.originalName,
          mimeType: document.mimeType,
          size: document.size,
        },
      },
    });

    await this.extractText(document, absoluteFilePath);

    return this.findOne(document.id);
  }

  async findByWorkspace(workspaceId: string): Promise<Document[]> {
    await this.workspacesService.findOne(workspaceId);

    const documents = await this.prisma.document.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map((document) => this.toDocument(document));
  }

  async findOne(documentId: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} was not found.`);
    }

    return this.toDocument(document);
  }

  async getText(documentId: string): Promise<DocumentTextResponse> {
    const document = await this.findOne(documentId);

    return {
      documentId: document.id,
      status: document.extractedTextStatus,
      text: document.extractedText,
      ...(document.extractionError ? { error: document.extractionError } : {}),
    };
  }

  private async extractText(
    document: {
      id: string;
      workspaceId: string;
      mimeType: string;
      status: Document['status'];
    },
    absoluteFilePath: string,
  ): Promise<void> {
    await this.updateExtraction(document, {
      extractedTextStatus: ExtractedTextStatus.PROCESSING,
      extractionError: null,
    });

    try {
      const parsedText = await this.documentTextParserService.parse(
        absoluteFilePath,
        document.mimeType,
      );

      const updatedDocument = await this.updateExtraction(document, {
        extractedText: parsedText.text,
        extractedTextStatus: parsedText.status,
        extractionError: parsedText.error || null,
        status:
          parsedText.status === ExtractedTextStatus.COMPLETED
            ? DocumentStatus.PARSED
            : document.status,
      });

      await this.prisma.feedbackEvent.create({
        data: {
          workspaceId: document.workspaceId,
          documentId: document.id,
          eventType: 'TEXT_EXTRACTED',
          payloadJson: {
            status: updatedDocument.extractedTextStatus,
            textLength: updatedDocument.extractedText?.length ?? 0,
            error: updatedDocument.extractionError,
          },
        },
      });
    } catch (error) {
      await this.updateExtraction(document, {
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
    document: { id: string },
    update: Partial<
      Pick<Document, 'extractedText' | 'extractedTextStatus' | 'status'>
    > & {
      extractionError?: string | null;
    },
  ) {
    return this.prisma.document.update({
      where: { id: document.id },
      data: update,
    });
  }

  private toDocument(document: {
    id: string;
    workspaceId: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    filePath: string;
    status: Document['status'];
    extractedText: string | null;
    extractedTextStatus: Document['extractedTextStatus'];
    extractionError: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Document {
    return {
      id: document.id,
      workspaceId: document.workspaceId,
      originalName: document.originalName,
      fileName: document.fileName,
      mimeType: document.mimeType,
      size: document.size,
      filePath: document.filePath,
      status: document.status,
      extractedText: document.extractedText,
      extractedTextStatus: document.extractedTextStatus,
      extractionError: document.extractionError || undefined,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }

  private getSafeExtension(originalName: string): string {
    const extension = extname(originalName).toLowerCase();
    return extension || '.bin';
  }
}
