import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsISO8601,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import {
  ScheduleDefinition,
  ScheduleExecutionResult,
  ScheduleFrequency,
  ScheduleOptions,
  ScheduleOwner,
  ScheduleType
} from '@compliance/shared';
import { SchedulerService } from './scheduler.service';

class ScheduleOwnerDto implements ScheduleOwner {
  @IsString()
  id!: string;

  @IsString()
  displayName!: string;

  @IsEmail()
  email!: string;
}

class ScheduleOptionsDto implements ScheduleOptions {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  intervalDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hour?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minute?: number;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

const scheduleTypeValues = [
  'evidence-review-reminder',
  'recurring-assessment',
  'agent-health-check',
  'profile-contact-reminder'
] as const;
const scheduleFrequencyValues = ['daily', 'weekly', 'monthly', 'quarterly', 'custom'] as const;

class CreateScheduleDto {
  @IsString()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(scheduleTypeValues)
  type!: ScheduleType;

  @IsIn(scheduleFrequencyValues)
  frequency!: ScheduleFrequency;

  @IsISO8601()
  nextRun!: string;

  @ValidateNested()
  @Type(() => ScheduleOwnerDto)
  owner!: ScheduleOwnerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleOptionsDto)
  options?: ScheduleOptionsDto;
}

class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(scheduleFrequencyValues)
  frequency?: ScheduleFrequency;

  @IsOptional()
  @IsISO8601()
  nextRun?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleOwnerDto)
  owner?: ScheduleOwnerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleOptionsDto)
  options?: ScheduleOptionsDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class ScheduleExecutionResultDto implements ScheduleExecutionResult {
  @IsString()
  scheduleId!: string;

  @IsISO8601()
  startedAt!: string;

  @IsISO8601()
  completedAt!: string;

  @IsBoolean()
  success!: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ScheduleExecutionDto {
  @ValidateNested()
  @Type(() => ScheduleExecutionResultDto)
  result!: ScheduleExecutionResultDto;

  @IsISO8601()
  nextRun!: string;
}

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get()
  async list(@Query('organizationId') organizationId?: string): Promise<{ data: ScheduleDefinition[] }> {
    const schedules = await this.schedulerService.list(organizationId);
    return { data: schedules };
  }

  @Post()
  async create(@Body() body: CreateScheduleDto): Promise<{ data: ScheduleDefinition }> {
    const schedule = await this.schedulerService.create(body);
    return { data: schedule };
  }

  @Put(':scheduleId')
  async update(@Param('scheduleId') scheduleId: string, @Body() body: UpdateScheduleDto): Promise<{ data: ScheduleDefinition }> {
    const schedule = await this.schedulerService.update(scheduleId, body);
    return { data: schedule };
  }

  @Delete(':scheduleId')
  async delete(@Param('scheduleId') scheduleId: string): Promise<{ data: { deleted: boolean } }> {
    await this.schedulerService.delete(scheduleId);
    return { data: { deleted: true } };
  }

  @Post(':scheduleId/executions')
  async recordExecution(
    @Param('scheduleId') scheduleId: string,
    @Body() body: ScheduleExecutionDto
  ): Promise<{ data: ScheduleDefinition }> {
    const result: ScheduleExecutionResult = {
      ...body.result,
      scheduleId
    };
    const schedule = await this.schedulerService.recordExecution(scheduleId, result, body.nextRun);
    return { data: schedule };
  }
}
