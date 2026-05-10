import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from './annotations.service';

@Module({
  imports: [DocumentsModule],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
})
export class AnnotationsModule {}
