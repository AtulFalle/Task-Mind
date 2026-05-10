import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AnnotationsModule } from '../annotations/annotations.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RulesModule } from '../rules/rules.module';
import { TrainingCandidatesModule } from '../training-candidates/training-candidates.module';

@Module({
  imports: [
    PrismaModule,
    WorkspacesModule,
    DocumentsModule,
    AnnotationsModule,
    RulesModule,
    TrainingCandidatesModule,
    FeedbackModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
