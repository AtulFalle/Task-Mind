import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: 'ok'; service: 'taskmindai-api' } {
    return { status: 'ok', service: 'taskmindai-api' };
  }
}
