import { IsIn, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApprovalDecisionDto {
  @IsIn(['approve', 'reject'])
  decision!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @IsOptional()
  @IsISO8601()
  effectiveAt?: string;
}
