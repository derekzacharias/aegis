import { Injectable } from '@nestjs/common';
import { EvidenceScanStatus, EvidenceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<DashboardOverview> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
          }
        }
      }),
      this.prisma.evidenceScan.count({
        where: {
          status: EvidenceScanStatus.INFECTED,
          completedAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      this.prisma.evidenceScan.count({
        where: {
          status: EvidenceScanStatus.FAILED,
          updatedAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      this.prisma.evidenceItem.count({
        where: {
          status: EvidenceStatus.QUARANTINED
        }
      }),
      this.prisma.evidenceScan.aggregate({
        where: {
          completedAt: {
            gte: sevenDaysAgo
          },
          durationMs: {
            not: null
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
      }
    };
  }
}
