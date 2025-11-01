import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { FrameworkFamily } from '../framework.types';

export class UpdateCustomFrameworkDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['NIST', 'CIS', 'PCI', 'CUSTOM'])
  family?: FrameworkFamily;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
