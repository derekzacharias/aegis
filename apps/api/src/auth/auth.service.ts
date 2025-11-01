import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User, UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser, AuthResponse, AuthTokens } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(payload: RegisterDto): Promise<AuthResponse> {
    const email = payload.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const organizationId = await this.resolveOrganizationId(payload.organizationSlug);

    const minLength = this.configService.get<number>('auth.passwordMinLength') ?? 12;

    if (payload.password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    const passwordHash = await hash(payload.password, 12);

    const role = this.ensureRole(payload.role);

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        passwordHash,
        role,
        organizationId
      }
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken, {
      lastLoginAt: new Date()
    });

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const email = payload.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await compare(payload.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken, {
      lastLoginAt: new Date()
    });

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async refresh(payload: RefreshDto): Promise<AuthResponse> {
    let decoded: { sub: string; type?: string };

    try {
      decoded = await this.jwtService.verifyAsync(payload.refreshToken, {
        secret: this.configService.get<string>('jwtSecret') ?? 'change-me'
      });
    } catch (error) {
      throw new UnauthorizedException('Unable to refresh session');
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Unable to refresh session');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Unable to refresh session');
    }

    const matches = await compare(payload.refreshToken, user.refreshTokenHash);

    if (!matches) {
      throw new UnauthorizedException('Unable to refresh session');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: {
        refreshTokenHash: null
      }
    });
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId
    };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };

    const accessTokenTtl = this.configService.get<number>('auth.accessTokenTtlSeconds') ?? 60 * 15;
    const refreshTokenTtl = this.configService.get<number>('auth.refreshTokenTtlSeconds') ?? 60 * 60 * 24 * 7;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTokenTtl
      }),
      this.jwtService.signAsync({ ...payload, type: 'refresh' }, { expiresIn: refreshTokenTtl })
    ]);

    return {
      accessToken,
      accessTokenExpiresIn: accessTokenTtl,
      refreshToken,
      refreshTokenExpiresIn: refreshTokenTtl
    };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    extra?: Prisma.UserUpdateInput
  ): Promise<void> {
    const hashed = await hash(refreshToken, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: hashed,
        ...(extra ?? {})
      }
    });
  }

  private ensureRole(role?: UserRole): UserRole {
    if (!role || role === UserRole.ADMIN) {
      return UserRole.ANALYST;
    }

    return role;
  }

  private async resolveOrganizationId(slug?: string): Promise<string> {
    if (slug) {
      const normalizedSlug = slug.toLowerCase();
      const organization = await this.prisma.organization.findUnique({
        where: { slug: normalizedSlug }
      });

      if (organization) {
        return organization.id;
      }
    }

    const fallback = await this.prisma.organization.findFirst();

    if (!fallback) {
      throw new BadRequestException('Organization not available');
    }

    return fallback.id;
  }
}
