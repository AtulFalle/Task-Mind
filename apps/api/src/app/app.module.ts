import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AnnotationsModule } from '../annotations/annotations.module';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [WorkspacesModule, DocumentsModule, AnnotationsModule, RulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
