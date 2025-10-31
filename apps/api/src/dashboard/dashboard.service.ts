import { Injectable } from '@nestjs/common';

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
}

@Injectable()
export class DashboardService {
  async getOverview(): Promise<DashboardOverview> {
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
      ]
    };
  }
}
