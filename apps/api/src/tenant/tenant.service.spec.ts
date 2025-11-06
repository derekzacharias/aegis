import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantService', () => {
  let service: TenantService;
  let prisma: jest.Mocked<PrismaService>;
  let organizationFindUnique: jest.Mock;
  let organizationUpdate: jest.Mock;
  let organizationSettingsFindUnique: jest.Mock;
  let organizationSettingsUpsert: jest.Mock;

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

    organizationFindUnique = prisma.organization.findUnique as unknown as jest.Mock;
    organizationUpdate = prisma.organization.update as unknown as jest.Mock;
    organizationSettingsFindUnique = prisma.organizationSettings.findUnique as unknown as jest.Mock;
    organizationSettingsUpsert = prisma.organizationSettings.upsert as unknown as jest.Mock;

    service = new TenantService(prisma);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns tenant profile for organization', async () => {
    organizationFindUnique.mockResolvedValueOnce({
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
    organizationFindUnique.mockResolvedValueOnce(null);

    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates tenant profile', async () => {
    organizationFindUnique.mockResolvedValueOnce({ id: 'org-1', slug: 'aegis' } as any);
    organizationUpdate.mockResolvedValueOnce({
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

    expect(organizationUpdate).toHaveBeenCalledWith({
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
    organizationFindUnique.mockResolvedValueOnce({ id: 'org-1', slug: 'slug' } as any);

    await expect(
      service.updateProfile('org-1', {
        organizationName: '   ',
        impactLevel: 'LOW',
        primaryContactEmail: undefined
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when organization not found on update', async () => {
    organizationFindUnique.mockResolvedValueOnce(null);

    await expect(
      service.updateProfile('org-1', {
        organizationName: 'Name',
        impactLevel: 'LOW',
        primaryContactEmail: undefined
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns default antivirus settings when none stored', async () => {
    organizationSettingsFindUnique.mockResolvedValueOnce(null as any);

    const settings = await service.getAntivirusSettings('org-1');

    expect(settings).toEqual({ autoReleaseStrategy: 'pending', updatedAt: null });
    expect(organizationSettingsFindUnique).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      select: { antivirusAutoReleaseStrategy: true, updatedAt: true }
    });
  });

  it('updates antivirus settings via upsert', async () => {
    const updatedAt = new Date('2025-11-04T09:00:00Z');
    organizationSettingsUpsert.mockResolvedValueOnce({
      antivirusAutoReleaseStrategy: 'previous',
      updatedAt
    } as any);

    const payload = await service.updateAntivirusSettings('org-1', {
      autoReleaseStrategy: 'previous'
    });

    expect(organizationSettingsUpsert).toHaveBeenCalledWith({
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
