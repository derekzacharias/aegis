import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { EvidenceItem, EvidenceService } from './evidence.service';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async list(): Promise<EvidenceItem[]> {
    return this.evidenceService.list();
  }

  @Post()
  async create(@Body() payload: CreateEvidenceDto): Promise<EvidenceItem> {
    return this.evidenceService.create(payload);
  }
}
