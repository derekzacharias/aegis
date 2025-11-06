import { Injectable } from '@nestjs/common';
import { EvidenceScanStatus, EvidenceStatus } from '@prisma/client';
import {
  CONTACT_STALE_DAYS,
  PROFILE_CRITICAL_FIELDS,
  ProfileCompletenessSummary,
  ProfileCriticalField
} from '@compliance/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/auth.types';

export interface DashboardOverview {
  stats: Array<{
    id: string;
    label: string;
    value: string;
    helper: string;
    trend: 'up' | 'down' | 'steady';
  }>;
  compliance: {
    current: number;
    target: number;
    quarters: Array<{
      period: string;
      percentage: number;
    }>;
  };
  riskMatrix: Array<{
    label: string;
    count: number;
    severity: 'very-low' | 'low' | 'moderate' | 'high' | 'critical';
  }>;
  activities: Array<{
    id: string;
    title: string;
    due: string;
    owner: string;
    status: string;
  }>;
  antivirus: {
    scansLast24h: number;
    infectedLast7d: number;
    failedLast7d: number;
    quarantinedEvidence: number;
    averageScanDurationMs: number | null;
    lastCompletedScanAt: string | null;
    engine: string | null;
  };
  contact: ProfileCompletenessSummary;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(user: AuthenticatedUser): Promise<DashboardOverview> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const organizationId = user.organizationId;

    const [
      scansLast24h,
      infectedLast7d,
      failedLast7d,
      quarantinedEvidence,
      avgDuration,
      latestScan
    ] = await this.prisma.$transaction([
      this.prisma.evidenceScan.count({
        where: {
          startedAt: {
            gte: oneDayAgo
          },
          evidence: {
            organizationId
          }
        }
      }),
      this.prisma.evidenceScan.count({
        where: {
          status: EvidenceScanStatus.INFECTED,
          completedAt: {
            gte: sevenDaysAgo
          },
          evidence: {
            organizationId
          }
        }
      }),
      this.prisma.evidenceScan.count({
        where: {
          status: EvidenceScanStatus.FAILED,
          updatedAt: {
            gte: sevenDaysAgo
          },
          evidence: {
            organizationId
          }
        }
      }),
      this.prisma.evidenceItem.count({
        where: {
          status: EvidenceStatus.QUARANTINED,
          organizationId
        }
      }),
      this.prisma.evidenceScan.aggregate({
        where: {
          completedAt: {
            gte: sevenDaysAgo
          },
          durationMs: {
            not: null
          },
          evidence: {
            organizationId
          }
        },
        _avg: {
          durationMs: true
        }
      }),
      this.prisma.evidenceScan.findFirst({
        where: {
          completedAt: {
            not: null
          },
          evidence: {
            organizationId
          }
        },
        orderBy: {
          completedAt: 'desc'
        },
        select: {
          completedAt: true,
          engine: true
        }
      })
    ]);

    const contact = await this.computeContactSummary(organizationId);

    return {
      stats: [
        {
          id: 'overall-compliance',
          label: 'Overall Compliance',
          value: '72%',
          helper: '+6% QoQ',
          trend: 'up'
        },
        {
          id: 'open-gaps',
          label: 'Open Gaps',
          value: '48',
          helper: '12 high risk',
          trend: 'steady'
        },
        {
          id: 'evidence-reviews',
          label: 'Evidence Reviews',
          value: '19',
          helper: 'Due this week',
          trend: 'down'
        },
        {
          id: 'fedramp-progress',
          label: 'FedRAMP Progress',
          value: '58%',
          helper: 'Moderate baseline',
          trend: 'up'
        }
      ],
      compliance: {
        current: 72,
        target: 85,
        quarters: [
          { period: 'FY23 Q4', percentage: 60 },
          { period: 'FY24 Q1', percentage: 64 },
          { period: 'FY24 Q2', percentage: 68 },
          { period: 'FY24 Q3', percentage: 72 }
        ]
      },
      riskMatrix: [
        { label: 'Very Low', count: 6, severity: 'very-low' },
        { label: 'Low', count: 14, severity: 'low' },
        { label: 'Moderate', count: 19, severity: 'moderate' },
        { label: 'High', count: 7, severity: 'high' },
        { label: 'Critical', count: 2, severity: 'critical' }
      ],
      activities: [
        {
          id: 'activity-ac-2',
          title: 'FedRAMP Control AC-2 reauthorization',
          due: 'Due in 2 days',
          owner: 'Alex Smith',
          status: 'High Risk'
        },
        {
          id: 'activity-cis-4',
          title: 'CIS Control 4: Vulnerability scan import',
          due: 'Scheduled tomorrow',
          owner: 'Automation Agent',
          status: 'Ingest'
        },
        {
          id: 'activity-pci-8',
          title: 'PCI DSS Control 8 evidence review',
          due: 'Due in 5 days',
          owner: 'Maria Chen',
          status: 'Pending Review'
        }
      ],
      antivirus: {
        scansLast24h,
        infectedLast7d,
        failedLast7d,
        quarantinedEvidence,
        averageScanDurationMs: avgDuration._avg.durationMs
          ? Math.round(avgDuration._avg.durationMs)
          : null,
        lastCompletedScanAt: latestScan?.completedAt?.toISOString() ?? null,
        engine: latestScan?.engine ?? null
      },
      contact
    };
  }

  private async computeContactSummary(organizationId: string): Promise<ProfileCompletenessSummary> {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        phoneNumber: true,
        timezone: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'asc'
      }
    });

    const baseCounts = PROFILE_CRITICAL_FIELDS.reduce<Record<ProfileCriticalField, number>>(
      (acc, field) => {
        acc[field] = 0;
        return acc;
      },
      {} as Record<ProfileCriticalField, number>
    );

    if (!users.length) {
      return {
        total: 0,
        complete: 0,
        incomplete: 0,
        stale: 0,
        completenessRate: 100,
        missingFieldCounts: baseCounts,
        attention: []
      };
    }

    const staleThresholdMs = CONTACT_STALE_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const attention: ProfileCompletenessSummary['attention'] = [];
    const missingFieldCounts = { ...baseCounts };
    let complete = 0;
    let incomplete = 0;
    let stale = 0;

    for (const user of users) {
      const lastUpdated = user.updatedAt ?? new Date();
      const isStale = now - lastUpdated.getTime() >= staleThresholdMs;
      const missingFields: ProfileCriticalField[] = [];

      for (const field of PROFILE_CRITICAL_FIELDS) {
        const value = user[field as keyof typeof user] as string | null | undefined;
        if (value === null || value === undefined) {
          missingFields.push(field);
          continue;
        }

        if (typeof value === 'string' && value.trim().length === 0) {
          missingFields.push(field);
        }
      }

      if (missingFields.length === 0) {
        complete += 1;
      } else {
        incomplete += 1;
        missingFields.forEach((field) => {
          missingFieldCounts[field] += 1;
        });
      }

      if (isStale) {
        stale += 1;
      }

      if (missingFields.length > 0 || isStale) {
        attention.push({
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
          missingFields,
          isStale,
          lastUpdated: lastUpdated.toISOString()
        });
      }
    }

    const completenessRate = Math.round((complete / users.length) * 100);

    const rankedAttention = attention
      .sort((a, b) => {
        const missingDiff = b.missingFields.length - a.missingFields.length;
        if (missingDiff !== 0) {
          return missingDiff;
        }
        const aUpdated = a.lastUpdated ? Date.parse(a.lastUpdated) : 0;
        const bUpdated = b.lastUpdated ? Date.parse(b.lastUpdated) : 0;
        return aUpdated - bUpdated;
      })
      .slice(0, 5);

    return {
      total: users.length,
      complete,
      incomplete,
      stale,
      completenessRate,
      missingFieldCounts,
      attention: rankedAttention
    };
  }
}
