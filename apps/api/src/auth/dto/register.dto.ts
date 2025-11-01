import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';

export const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/;

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message:
      'Password must be at least 12 characters long and include upper, lower, number, and special characters'
  })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  organizationSlug?: string;
}
