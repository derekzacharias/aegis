import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AssessmentService, AssessmentSummary } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentStatusDto } from './dto/update-assessment-status.dto';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get()
  async list(): Promise<AssessmentSummary[]> {
    return this.assessmentService.list();
  }

  @Post()
  async create(@Body() dto: CreateAssessmentDto): Promise<AssessmentSummary> {
    return this.assessmentService.create(dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentStatusDto
  ): Promise<AssessmentSummary> {
    return this.assessmentService.updateStatus(id, dto.status);
  }
}
