import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { CONTROL_STATUS_VALUES, ControlStatusValue } from '../assessment.constants';

const OPTIONAL_EMAIL_REGEX = /^\s*$|^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class UpdateAssessmentControlDto {
  @IsOptional()
  @IsIn(CONTROL_STATUS_VALUES)
  status?: ControlStatusValue;

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
  @IsString()
  comments?: string;
}
