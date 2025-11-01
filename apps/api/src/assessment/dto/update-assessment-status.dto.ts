import { IsIn } from 'class-validator';
import { ASSESSMENT_STATUS_VALUES, AssessmentStatusValue } from '../assessment.constants';

export class UpdateAssessmentStatusDto {
  @IsIn(ASSESSMENT_STATUS_VALUES)
  status!: AssessmentStatusValue;
}
