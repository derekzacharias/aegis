import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetCrosswalkDto {
  @IsOptional()
  @IsString()
  targetFrameworkId?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : parseFloat(value)))
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;
}
