import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check API health' })
  @ApiOkResponse({
    description: 'The API is reachable.',
    schema: {
      example: {
        status: 'ok',
        service: 'taskmindai-api',
      },
      properties: {
        status: { enum: ['ok'], type: 'string' },
        service: { example: 'taskmindai-api', type: 'string' },
      },
      type: 'object',
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
