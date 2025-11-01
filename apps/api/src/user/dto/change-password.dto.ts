import { IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { PASSWORD_COMPLEXITY_REGEX } from '../../auth/dto/register.dto';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message:
      'Password must be at least 12 characters long and include upper, lower, number, and special characters'
  })
  newPassword!: string;
}
