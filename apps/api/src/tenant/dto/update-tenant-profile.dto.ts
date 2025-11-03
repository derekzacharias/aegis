import { ImpactLevel } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTenantProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  organizationName!: string;

  @IsEnum(ImpactLevel)
  impactLevel!: ImpactLevel;

  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  primaryContactEmail?: string;
}
