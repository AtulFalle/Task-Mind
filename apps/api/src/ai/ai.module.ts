import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AiContextBuilderService } from '../app/modules/ai-orchestration/services/ai-context-builder.service';
import { AiController, AiSuggestionReviewController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [DocumentsModule, PrismaModule, WorkspacesModule],
  controllers: [AiController, AiSuggestionReviewController],
  providers: [AiContextBuilderService, AiService],
})
export class AiModule {}
