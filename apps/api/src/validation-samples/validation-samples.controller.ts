import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { DocumentTypeValidationSamplesResponse } from '@task-mind/shared';
import { DocumentTypeValidationSamplesResponseDto } from './dto/document-type-validation-sample.dto';
import { ValidationSamplesService } from './validation-samples.service';

@ApiTags('validation-samples')
@Controller('validation-samples')
export class ValidationSamplesController {
  constructor(
    private readonly validationSamplesService: ValidationSamplesService,
  ) {}

  @Get('document-types')
  @ApiOperation({
    summary: 'List manual document type validation samples',
  })
  @ApiOkResponse({
    description: 'Manual document type classification validation samples.',
    type: DocumentTypeValidationSamplesResponseDto,
  })
  getDocumentTypeSamples(): DocumentTypeValidationSamplesResponse {
    return this.validationSamplesService.getDocumentTypeSamples();
  }
}
