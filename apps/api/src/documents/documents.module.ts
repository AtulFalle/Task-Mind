import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { DocumentTextParserService } from './document-text-parser.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentTextParserService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
