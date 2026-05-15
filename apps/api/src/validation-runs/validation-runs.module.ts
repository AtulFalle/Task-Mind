import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ValidationRunsController } from './validation-runs.controller';
import { ValidationRunsService } from './validation-runs.service';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [ValidationRunsController],
  providers: [ValidationRunsService],
})
export class ValidationRunsModule {}
