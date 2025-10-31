import { IsIn } from 'class-validator';
import { AssessmentStatus } from '../assessment.service';

export const ASSESSMENT_STATUS_VALUES: AssessmentStatus[] = ['draft', 'in-progress', 'complete'];

export class UpdateAssessmentStatusDto {
  @IsIn(ASSESSMENT_STATUS_VALUES)
  status!: AssessmentStatus;
}
