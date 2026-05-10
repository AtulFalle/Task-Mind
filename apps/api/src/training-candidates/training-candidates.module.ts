import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TrainingCandidatesController } from './training-candidates.controller';
import { TrainingCandidatesService } from './training-candidates.service';

@Module({
  imports: [DocumentsModule, WorkspacesModule],
  controllers: [TrainingCandidatesController],
  providers: [TrainingCandidatesService],
})
export class TrainingCandidatesModule {}
