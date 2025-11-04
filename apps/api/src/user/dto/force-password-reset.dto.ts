import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForcePasswordResetDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number.parseInt(value, 10) : value))
  @IsInt()
  @IsPositive()
  expiresInHours?: number;
}
