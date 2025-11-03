import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantProfile } from '@compliance/shared';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(organizationId: string): Promise<TenantProfile> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        impactLevel: true,
        primaryContactEmail: true,
        updatedAt: true
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      organizationName: organization.name,
      impactLevel: organization.impactLevel,
      primaryContactEmail: organization.primaryContactEmail,
      updatedAt: organization.updatedAt.toISOString()
    };
  }

  async updateProfile(
    organizationId: string,
    payload: UpdateTenantProfileDto
  ): Promise<TenantProfile> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, slug: true }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const sanitizedName = payload.organizationName.trim();
    if (sanitizedName.length === 0) {
      throw new BadRequestException('Organization name is required');
    }

    const slug = this.slugify(sanitizedName);

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: sanitizedName,
        slug,
        impactLevel: payload.impactLevel,
        primaryContactEmail: payload.primaryContactEmail?.trim() || null
      },
      select: {
        name: true,
        impactLevel: true,
        primaryContactEmail: true,
        updatedAt: true
      }
    });

    return {
      organizationName: updated.name,
      impactLevel: updated.impactLevel,
      primaryContactEmail: updated.primaryContactEmail,
      updatedAt: updated.updatedAt.toISOString()
    };
  }

  private slugify(value: string): string {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return normalized || `organization-${Date.now()}`;
  }
}
