import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AiController, AiSuggestionReviewController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [DocumentsModule, PrismaModule, WorkspacesModule],
  controllers: [AiController, AiSuggestionReviewController],
  providers: [AiService],
})
export class AiModule {}
