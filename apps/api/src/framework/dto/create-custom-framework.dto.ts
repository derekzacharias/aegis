import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from 'class-validator';
import { BaselineLevel, ControlPriority, FrameworkFamily } from '../framework.types';

export class CustomControlMappingDto {
  @IsString()
  @IsNotEmpty()
  targetControlId!: string;

  @IsOptional()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsString()
  rationale?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CustomControlDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  family!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(['P0', 'P1', 'P2', 'P3'])
  priority!: ControlPriority;

  @IsOptional()
  @IsIn(['base', 'enhancement'])
  kind?: 'base' | 'enhancement';

  @IsOptional()
  @IsArray()
  @IsIn(['low', 'moderate', 'high', 'privacy'], { each: true })
  baselines?: BaselineLevel[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedControls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomControlMappingDto)
  mappings?: CustomControlMappingDto[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateCustomFrameworkDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  version!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsIn(['NIST', 'CIS', 'PCI', 'CUSTOM'])
  family?: FrameworkFamily;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomControlDto)
  controls?: CustomControlDto[];
}
