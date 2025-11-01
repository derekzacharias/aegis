import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { ReportingService } from './reporting.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { ReportJobView } from '@compliance/shared';
import type { Response } from 'express';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post()
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async create(
    @Body() payload: CreateReportDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ReportJobView> {
    return this.reportingService.queueReport(
      user.organizationId,
      payload.assessmentId,
      payload.formats,
      user.email
    );
  }

  @Get()
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.ADMIN, UserRole.AUDITOR)
  async list(): Promise<ReportJobView[]> {
    return this.reportingService.list();
  }

  @Get(':jobId')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.ADMIN, UserRole.AUDITOR)
  async detail(@Param('jobId') jobId: string): Promise<ReportJobView> {
    return this.reportingService.get(jobId);
  }

  @Get(':jobId/download')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.ADMIN, UserRole.AUDITOR)
  async download(
    @Param('jobId') jobId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const artifact = await this.reportingService.getArtifact(jobId, 'pdf');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${artifact.filename}"`
    });
    return this.reportingService.streamArtifact(artifact);
  }
}
