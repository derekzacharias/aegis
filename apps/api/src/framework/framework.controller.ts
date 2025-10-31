import { Controller, Get } from '@nestjs/common';
import { FrameworkService, FrameworkSummary } from './framework.service';

@Controller('frameworks')
export class FrameworkController {
  constructor(private readonly frameworkService: FrameworkService) {}

  @Get()
  async list(): Promise<FrameworkSummary[]> {
    return this.frameworkService.list();
  }
}
