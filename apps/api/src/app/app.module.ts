import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [WorkspacesModule, DocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
