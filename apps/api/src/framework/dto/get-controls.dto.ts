import { Transform } from 'class-transformer';
import { ControlStatus } from '@prisma/client';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { ControlPriority } from '../framework.types';

export class GetFrameworkControlsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  family?: string;

  @IsOptional()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  priority?: ControlPriority;

  @IsOptional()
  @IsIn(['base', 'enhancement'])
  type?: 'base' | 'enhancement';

  @IsOptional()
  @IsIn(['UNASSESSED', 'SATISFIED', 'PARTIAL', 'UNSATISFIED', 'NOT_APPLICABLE'])
  status?: ControlStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  page = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 25;
}
