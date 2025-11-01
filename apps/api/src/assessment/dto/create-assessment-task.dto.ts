import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  TaskPriorityValue,
  TaskStatusValue
} from '../assessment.constants';

const OPTIONAL_EMAIL_REGEX = /^\s*$|^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class CreateAssessmentTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(OPTIONAL_EMAIL_REGEX, {
    message: 'owner must be empty or a valid email address'
  })
  owner?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: TaskStatusValue;

  @IsOptional()
  @IsIn(TASK_PRIORITY_VALUES)
  priority?: TaskPriorityValue;

  @IsOptional()
  @IsString()
  assessmentControlId?: string;
}
