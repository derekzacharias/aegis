import { Controller, Get } from '@nestjs/common';
import { EvidenceItem, EvidenceService } from './evidence.service';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async list(): Promise<EvidenceItem[]> {
    return this.evidenceService.list();
  }
}
