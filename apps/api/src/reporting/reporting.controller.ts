import { Body, Controller, Post } from '@nestjs/common';
import { ReportingService, ReportRequestResult } from './reporting.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post()
  async create(@Body() payload: CreateReportDto): Promise<ReportRequestResult> {
    return this.reportingService.queueReport(payload.assessmentId, payload.formats);
  }
}
