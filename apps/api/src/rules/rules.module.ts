import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}
