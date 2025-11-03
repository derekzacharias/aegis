import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FrameworkService } from './framework.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FrameworkService', () => {
  let service: FrameworkService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      framework: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      },
      control: {
        count: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      controlMapping: {
        deleteMany: jest.fn(),
        create: jest.fn()
      },
      assessmentControl: {
        groupBy: jest.fn(),
        count: jest.fn()
      },
      assessmentFramework: {
        count: jest.fn()
      },
      evidenceFramework: {
        count: jest.fn(),
        deleteMany: jest.fn()
      },
      $transaction: jest.fn().mockImplementation(async (callback: any) => callback(prisma))
    };

    service = new FrameworkService(prisma as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('returns persisted frameworks when available', async () => {
    prisma.framework.findMany.mockResolvedValue([
      {
        id: 'nist-800-53-rev5',
        slug: 'nist-800-53-rev5',
        name: 'NIST 800-53',
        version: 'Rev 5',
        description: 'Controls',
        family: 'NIST',
        status: 'PUBLISHED',
        isCustom: false,
        controlCount: 410,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        publishedAt: new Date('2024-01-02T00:00:00.000Z'),
        metadata: null,
        organizationId: 'org-1'
      }
    ] as any);

    const result = await service.list('org-1');

    expect(prisma.framework.findMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      orderBy: [{ status: 'desc' }, { family: 'asc' }, { name: 'asc' }]
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('nist-800-53-rev5');
    expect(result[0].status).toEqual('PUBLISHED');
  });

  it('falls back to seeded frameworks when none are persisted', async () => {
    prisma.framework.findMany.mockResolvedValue([]);

    jest.useFakeTimers().setSystemTime(new Date('2024-05-01T12:00:00.000Z'));
    const result = await service.list('org-1');

    expect(result).toHaveLength(6);
    expect(result.map((framework) => framework.id)).toEqual(
      expect.arrayContaining(['iso-27001-2022', 'iso-27002-2022'])
    );
    expect(result[0].status).toEqual('PUBLISHED');
    expect(result[0].createdAt).toEqual('2024-05-01T12:00:00.000Z');
  });

  it('lists controls with catalog facets', async () => {
    const frameworkRecord = {
      id: 'framework-1',
      slug: 'framework-1',
      name: 'Custom Framework',
      version: '1.0',
      description: 'Internal baseline',
      family: 'CUSTOM',
      status: 'DRAFT',
      isCustom: true,
      controlCount: 0,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      publishedAt: null,
      metadata: null,
      organizationId: 'org-1'
    };

    prisma.framework.findFirst.mockResolvedValue(frameworkRecord as any);
    prisma.control.count.mockResolvedValue(1);

    prisma.control.findMany.mockResolvedValue([
      {
        id: 'ra-5',
        frameworkId: frameworkRecord.id,
        family: 'Risk Assessment',
        kind: 'BASE',
        parentId: null,
        title: 'Vulnerability Monitoring',
        description: 'Monitor and scan for vulnerabilities.',
        priority: 'P1',
        baselines: ['LOW'],
        keywords: ['vulnerability'],
        references: ['nist-sp-800-53'],
        relatedControls: [],
        tags: ['baseline'],
        metadata: { clause: 'A.5.1' },
        sourceMappings: [
          {
            id: 'mapping-1',
            targetControlId: 'cis-4-1',
            confidence: 0.82,
            origin: 'SEED',
            tags: ['vulnerability'],
            rationale: null,
            targetControl: {
              id: 'cis-4-1',
              title: 'Establish Vulnerability Management',
              framework: {
                id: 'cis-v8',
                name: 'CIS Critical Security Controls',
                version: '8'
              }
            },
            evidenceHints: []
          }
        ],
        assessmentControls: [
          {
            id: 'assessment-control-1',
            status: 'SATISFIED',
            dueDate: null,
            assessment: {
              id: 'assessment-1',
              name: 'FedRAMP Moderate Readiness',
              status: 'IN_PROGRESS'
            },
            evidenceLinks: [
              {
                evidence: {
                  id: 'evidence-1',
                  name: 'Monthly scan',
                  status: 'APPROVED',
                  storageUri: 's3://bucket/item',
                  uploadedAt: new Date('2024-05-01T00:00:00.000Z'),
                  metadata: { tags: ['scan'] },
                  frameworks: [
                    {
                      framework: {
                        id: 'nist-800-53-rev5',
                        name: 'NIST 800-53',
                        version: 'Rev 5'
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ] as any);

    (prisma.control.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ family: 'Risk Assessment', _count: { _all: 1 } }])
      .mockResolvedValueOnce([{ priority: 'P1', _count: { _all: 1 } }])
      .mockResolvedValueOnce([{ kind: 'BASE', _count: { _all: 1 } }]);

    prisma.assessmentControl.groupBy.mockResolvedValue([{ status: 'SATISFIED', _count: { _all: 1 } }]);

    const result = await service.listControls('org-1', frameworkRecord.id, {
      page: 1,
      pageSize: 10
    });

    expect(result.total).toEqual(1);
    expect(result.facets.families[0]).toEqual({ value: 'Risk Assessment', count: 1 });
    expect(result.items[0].mappings).toHaveLength(1);
    expect(result.items[0].statusSummary[0]).toEqual({ status: 'SATISFIED', count: 1 });
    expect(result.items[0].metadata?.['clause']).toEqual('A.5.1');
  });

  it('throws when publishing without controls', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-1',
      organizationId: 'org-1'
    } as any);
    prisma.control.count.mockResolvedValue(0);

    await expect(
      service.publishFramework('org-1', 'framework-1', 'user-1', {})
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('publishes a custom framework with metadata', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-1',
      slug: 'framework-1',
      name: 'Custom Framework',
      version: '1.0',
      description: 'Internal baseline',
      family: 'CUSTOM',
      status: 'DRAFT',
      isCustom: true,
      controlCount: 5,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      publishedAt: null,
      metadata: null,
      organizationId: 'org-1'
    } as any);
    prisma.control.count.mockResolvedValue(5);
    prisma.framework.update.mockResolvedValue({
      id: 'framework-1',
      slug: 'framework-1',
      name: 'Custom Framework',
      version: '1.0',
      description: 'Internal baseline',
      family: 'CUSTOM',
      status: 'PUBLISHED',
      isCustom: true,
      controlCount: 5,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-05-02T00:00:00.000Z'),
      publishedAt: new Date('2024-05-02T00:00:00.000Z'),
      metadata: { wizard: { completedAt: '2024-05-02T00:00:00.000Z' } },
      organizationId: 'org-1'
    } as any);

    const result = await service.publishFramework('org-1', 'framework-1', 'user-1', {
      metadata: { wizard: { completedAt: '2024-05-02T00:00:00.000Z' } }
    });

    expect(prisma.framework.update).toHaveBeenCalledWith({
      where: { id: 'framework-1' },
      data: {
        status: 'PUBLISHED',
        updatedById: 'user-1',
        publishedAt: expect.any(Date),
        metadata: { wizard: { completedAt: '2024-05-02T00:00:00.000Z' } }
      }
    });
    expect(result.status).toEqual('PUBLISHED');
  });

  it('deletes a custom framework when no dependencies exist', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-custom',
      organizationId: 'org-1',
      isCustom: true
    });
    prisma.assessmentFramework.count.mockResolvedValue(0);
    prisma.assessmentControl.count.mockResolvedValue(0);
    prisma.evidenceFramework.count.mockResolvedValue(0);
    prisma.control.findMany.mockResolvedValue([{ id: 'ctrl-1' }, { id: 'ctrl-2' }]);

    await service.deleteCustomFramework('org-1', 'framework-custom');

    expect(prisma.controlMapping.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { sourceControlId: { in: ['ctrl-1', 'ctrl-2'] } },
          { targetControlId: { in: ['ctrl-1', 'ctrl-2'] } }
        ]
      }
    });
    expect(prisma.control.deleteMany).toHaveBeenCalledWith({ where: { frameworkId: 'framework-custom' } });
    expect(prisma.evidenceFramework.deleteMany).toHaveBeenCalledWith({ where: { frameworkId: 'framework-custom' } });
    expect(prisma.framework.delete).toHaveBeenCalledWith({ where: { id: 'framework-custom' } });
  });

  it('prevents deletion for non-custom frameworks', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-seed',
      organizationId: 'org-1',
      isCustom: false
    });

    await expect(
      service.deleteCustomFramework('org-1', 'framework-seed')
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents deletion when framework is linked to assessments', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-custom',
      organizationId: 'org-1',
      isCustom: true
    });
    prisma.assessmentFramework.count.mockResolvedValue(1);
    prisma.assessmentControl.count.mockResolvedValue(0);
    prisma.evidenceFramework.count.mockResolvedValue(0);

    await expect(
      service.deleteCustomFramework('org-1', 'framework-custom')
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes a custom framework when no dependencies exist', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-custom',
      organizationId: 'org-1',
      isCustom: true
    });
    prisma.assessmentFramework.count.mockResolvedValue(0);
    prisma.assessmentControl.count.mockResolvedValue(0);
    prisma.evidenceFramework.count.mockResolvedValue(0);
    prisma.control.findMany.mockResolvedValue([{ id: 'ctrl-1' }, { id: 'ctrl-2' }]);

    await service.deleteCustomFramework('org-1', 'framework-custom');

    expect(prisma.controlMapping.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { sourceControlId: { in: ['ctrl-1', 'ctrl-2'] } },
          { targetControlId: { in: ['ctrl-1', 'ctrl-2'] } }
        ]
      }
    });
    expect(prisma.control.deleteMany).toHaveBeenCalledWith({ where: { frameworkId: 'framework-custom' } });
    expect(prisma.evidenceFramework.deleteMany).toHaveBeenCalledWith({ where: { frameworkId: 'framework-custom' } });
    expect(prisma.framework.delete).toHaveBeenCalledWith({ where: { id: 'framework-custom' } });
  });

  it('prevents deletion when framework is not custom', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-seed',
      organizationId: 'org-1',
      isCustom: false
    });

    await expect(service.deleteCustomFramework('org-1', 'framework-seed')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('prevents deletion when framework is linked to assessments', async () => {
    prisma.framework.findFirst.mockResolvedValue({
      id: 'framework-custom',
      organizationId: 'org-1',
      isCustom: true
    });
    prisma.assessmentFramework.count.mockResolvedValue(1);
    prisma.assessmentControl.count.mockResolvedValue(0);
    prisma.evidenceFramework.count.mockResolvedValue(0);

    await expect(service.deleteCustomFramework('org-1', 'framework-custom')).rejects.toBeInstanceOf(
      BadRequestException
    );
  });
});
