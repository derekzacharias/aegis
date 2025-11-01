import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { AssessmentService, AssessmentSummary } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentStatusDto } from './dto/update-assessment-status.dto';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get()
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async list(@CurrentUser() user: AuthenticatedUser): Promise<AssessmentSummary[]> {
    return this.assessmentService.list(user.organizationId);
  }

  @Post()
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAssessmentDto
  ): Promise<AssessmentSummary> {
    return this.assessmentService.create(user.organizationId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentStatusDto
  ): Promise<AssessmentSummary> {
    return this.assessmentService.updateStatus(user.organizationId, id, dto.status);
  }

  @Get(':id/evidence-reuse')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async listEvidenceReuse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return this.assessmentService.getEvidenceReuseRecommendations(user.organizationId, id);
  }
}
