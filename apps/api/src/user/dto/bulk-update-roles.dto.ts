import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class BulkUpdateRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds!: string[];

  @IsEnum(UserRole)
  role!: UserRole;
}
