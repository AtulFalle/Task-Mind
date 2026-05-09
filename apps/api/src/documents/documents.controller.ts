import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Document } from '@task-mind/shared';
import { memoryStorage } from 'multer';
import { extname } from 'node:path';
import { DocumentDto } from './dto/document.dto';
import { DocumentsService } from './documents.service';

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt']);

@ApiTags('documents')
@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('workspaces/:workspaceId/documents/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();

        if (
          !ALLOWED_MIME_TYPES.has(file.mimetype) &&
          !ALLOWED_EXTENSIONS.has(extension)
        ) {
          callback(
            new BadRequestException(
              'Unsupported file type. Upload PDF, DOCX, or TXT files only.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a document into a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id that owns the uploaded document.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF, DOCX, or TXT document. Maximum size: 10MB.',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Document uploaded.',
    type: DocumentDto,
  })
  @ApiBadRequestResponse({
    description: 'Missing, too large, or unsupported document file.',
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  upload(
    @Param('workspaceId') workspaceId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<Document> {
    return this.documentsService.upload(workspaceId, file);
  }

  @Get('workspaces/:workspaceId/documents')
  @ApiOperation({ summary: 'List documents for a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace id.',
    example: '8ef84f25-08d8-43bd-b6ac-6c67e7f5edb2',
  })
  @ApiOkResponse({
    description: 'Documents ordered newest first.',
    type: DocumentDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Workspace was not found.' })
  findByWorkspace(@Param('workspaceId') workspaceId: string): Document[] {
    return this.documentsService.findByWorkspace(workspaceId);
  }

  @Get('documents/:documentId')
  @ApiOperation({ summary: 'Get document metadata by id' })
  @ApiParam({
    name: 'documentId',
    description: 'Document id.',
    example: '25ab7e76-a1fd-443a-a803-0d0b81f6269b',
  })
  @ApiOkResponse({
    description: 'Document found.',
    type: DocumentDto,
  })
  @ApiNotFoundResponse({ description: 'Document was not found.' })
  findOne(@Param('documentId') documentId: string): Document {
    return this.documentsService.findOne(documentId);
  }
}
