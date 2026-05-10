import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [DocumentsModule, WorkspacesModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
