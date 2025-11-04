import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { AuthenticatedUser, AuthResponse } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() payload: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(payload);
  }

  @Public()
  @Post('login')
  async login(@Body() payload: LoginDto): Promise<AuthResponse> {
    return this.authService.login(payload);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() payload: RefreshDto): Promise<AuthResponse> {
    return this.authService.refresh(payload);
  }

  @Public()
  @Post('invite/accept')
  async acceptInvite(@Body() payload: AcceptInviteDto): Promise<AuthResponse> {
    return this.authService.acceptInvite(payload);
  }

  @Public()
  @Post('password/reset')
  async resetPassword(@Body() payload: ResetPasswordDto): Promise<{ success: true }> {
    await this.authService.resetPasswordWithToken(payload);
    return { success: true };
  }

  @Post('logout')
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<{ success: true }> {
    await this.authService.logout(user.id);
    return { success: true };
  }

  @Get('me')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUser> {
    return this.authService.getProfile(user.id);
  }
}
