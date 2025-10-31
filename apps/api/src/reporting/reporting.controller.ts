import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReportingService, ReportJob } from './reporting.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post()
  async create(@Body() payload: CreateReportDto): Promise<ReportJob> {
    return this.reportingService.queueReport(payload.assessmentId, payload.formats);
  }

  @Get()
  async list(): Promise<ReportJob[]> {
    return this.reportingService.list();
  }
}
