import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantService', () => {
  let service: TenantService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      organization: {
        findUnique: jest.fn(),
        update: jest.fn()
      },
      organizationSettings: {
        findUnique: jest.fn(),
        upsert: jest.fn()
      }
    } as unknown as jest.Mocked<PrismaService>;

    service = new TenantService(prisma);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns tenant profile for organization', async () => {
    prisma.organization.findUnique.mockResolvedValueOnce({
      name: 'Aegis Corp',
      impactLevel: 'MODERATE',
      primaryContactEmail: 'admin@example.com',
      updatedAt: new Date('2025-11-03T12:00:00Z')
    } as any);

    const profile = await service.getProfile('org-1');

    expect(profile).toEqual({
      organizationName: 'Aegis Corp',
      impactLevel: 'MODERATE',
      primaryContactEmail: 'admin@example.com',
      updatedAt: '2025-11-03T12:00:00.000Z'
    });
  });

  it('throws when organization not found during get', async () => {
    prisma.organization.findUnique.mockResolvedValueOnce(null);

    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates tenant profile', async () => {
    prisma.organization.findUnique.mockResolvedValueOnce({ id: 'org-1', slug: 'aegis' } as any);
    prisma.organization.update.mockResolvedValueOnce({
      name: 'New Name',
      impactLevel: 'HIGH',
      primaryContactEmail: null,
      updatedAt: new Date('2025-11-04T08:00:00Z')
    } as any);

    const profile = await service.updateProfile('org-1', {
      organizationName: 'New Name',
      impactLevel: 'HIGH',
      primaryContactEmail: undefined
    });

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: 'org-1' },
      data: {
        name: 'New Name',
        slug: expect.stringMatching(/^new-name/),
        impactLevel: 'HIGH',
        primaryContactEmail: null
      },
      select: expect.any(Object)
    });

    expect(profile.impactLevel).toEqual('HIGH');
  });

  it('prevents empty organization name on update', async () => {
    prisma.organization.findUnique.mockResolvedValueOnce({ id: 'org-1', slug: 'slug' } as any);

    await expect(
      service.updateProfile('org-1', {
        organizationName: '   ',
        impactLevel: 'LOW',
        primaryContactEmail: undefined
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when organization not found on update', async () => {
    prisma.organization.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.updateProfile('org-1', {
        organizationName: 'Name',
        impactLevel: 'LOW',
        primaryContactEmail: undefined
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns default antivirus settings when none stored', async () => {
    prisma.organizationSettings.findUnique.mockResolvedValueOnce(null as any);

    const settings = await service.getAntivirusSettings('org-1');

    expect(settings).toEqual({ autoReleaseStrategy: 'pending', updatedAt: null });
    expect(prisma.organizationSettings.findUnique).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      select: { antivirusAutoReleaseStrategy: true, updatedAt: true }
    });
  });

  it('updates antivirus settings via upsert', async () => {
    const updatedAt = new Date('2025-11-04T09:00:00Z');
    prisma.organizationSettings.upsert.mockResolvedValueOnce({
      antivirusAutoReleaseStrategy: 'previous',
      updatedAt
    } as any);

    const payload = await service.updateAntivirusSettings('org-1', {
      autoReleaseStrategy: 'previous'
    });

    expect(prisma.organizationSettings.upsert).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      update: { antivirusAutoReleaseStrategy: 'previous' },
      create: { organizationId: 'org-1', antivirusAutoReleaseStrategy: 'previous' },
      select: { antivirusAutoReleaseStrategy: true, updatedAt: true }
    });
    expect(payload).toEqual({
      autoReleaseStrategy: 'previous',
      updatedAt: updatedAt.toISOString()
    });
  });
});
