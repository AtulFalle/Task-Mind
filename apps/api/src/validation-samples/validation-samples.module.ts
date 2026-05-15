import { Module } from '@nestjs/common';
import { ValidationSamplesController } from './validation-samples.controller';
import { ValidationSamplesService } from './validation-samples.service';

@Module({
  controllers: [ValidationSamplesController],
  providers: [ValidationSamplesService],
})
export class ValidationSamplesModule {}
