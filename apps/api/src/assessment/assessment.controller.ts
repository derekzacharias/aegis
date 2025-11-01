import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import {
  AssessmentControlView,
  AssessmentControlSummary,
  AssessmentDetail,
  AssessmentService,
  AssessmentSummary,
  AssessmentTaskSummary
} from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { UpdateAssessmentStatusDto } from './dto/update-assessment-status.dto';
import { UpdateAssessmentControlDto } from './dto/update-assessment-control.dto';
import { CreateAssessmentTaskDto } from './dto/create-assessment-task.dto';
import { UpdateAssessmentTaskDto } from './dto/update-assessment-task.dto';

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
    return this.assessmentService.create(user.organizationId, user, dto);
  }

  @Get(':id')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ): Promise<AssessmentDetail> {
    return this.assessmentService.get(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentDto
  ): Promise<AssessmentDetail> {
    return this.assessmentService.update(user.organizationId, id, user, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    return this.assessmentService.remove(user.organizationId, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentStatusDto
  ): Promise<AssessmentSummary> {
    return this.assessmentService.updateStatus(user.organizationId, id, user, dto.status);
  }

  @Get(':id/controls')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async listControls(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ): Promise<AssessmentControlSummary[]> {
    return this.assessmentService.listControls(user.organizationId, id);
  }

  @Patch(':id/controls/:controlId')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async updateControl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') assessmentId: string,
    @Param('controlId') controlId: string,
    @Body() dto: UpdateAssessmentControlDto
  ): Promise<AssessmentControlView> {
    return this.assessmentService.updateControl(
      user.organizationId,
      assessmentId,
      controlId,
      user,
      dto
    );
  }

  @Post(':id/tasks')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') assessmentId: string,
    @Body() dto: CreateAssessmentTaskDto
  ): Promise<AssessmentTaskSummary> {
    return this.assessmentService.createTask(user.organizationId, assessmentId, user, dto);
  }

  @Patch(':id/tasks/:taskId')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') assessmentId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateAssessmentTaskDto
  ): Promise<AssessmentTaskSummary> {
    return this.assessmentService.updateTask(
      user.organizationId,
      assessmentId,
      taskId,
      user,
      dto
    );
  }

  @Delete(':id/tasks/:taskId')
  @HttpCode(204)
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async deleteTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') assessmentId: string,
    @Param('taskId') taskId: string
  ): Promise<void> {
    return this.assessmentService.deleteTask(user.organizationId, assessmentId, taskId, user);
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
