import { Controller, Get } from '@nestjs/common';
import { DocsResponse } from '@compliance/shared';
import { DocsService } from './docs.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  @Public()
  getDocs(): DocsResponse {
    return this.docsService.getDocs();
  }
}
