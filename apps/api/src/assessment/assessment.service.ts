import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type AssessmentStatus = 'draft' | 'in-progress' | 'complete';

export interface AssessmentSummary {
  id: string;
  name: string;
  frameworkIds: string[];
  status: AssessmentStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
  progress: {
    satisfied: number;
    partial: number;
    unsatisfied: number;
    total: number;
  };
}

@Injectable()
export class AssessmentService {
  private readonly assessments: Map<string, AssessmentSummary> = new Map();

  constructor() {
    const now = new Date().toISOString();
    const initialAssessment: AssessmentSummary = {
      id: uuidv4(),
      name: 'FedRAMP Moderate Baseline Readiness',
      frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
      status: 'in-progress',
      owner: 'compliance-team@example.com',
      createdAt: now,
      updatedAt: now,
      progress: {
        satisfied: 142,
        partial: 98,
        unsatisfied: 34,
        total: 310
      }
    };

    this.assessments.set(initialAssessment.id, initialAssessment);

    const draftAssessment: AssessmentSummary = {
      id: uuidv4(),
      name: 'PCI DSS 4.0 Gap Analysis',
      frameworkIds: ['pci-dss-4-0'],
      status: 'draft',
      owner: 'payments@example.com',
      createdAt: now,
      updatedAt: now,
      progress: {
        satisfied: 32,
        partial: 21,
        unsatisfied: 18,
        total: 120
      }
    };

    this.assessments.set(draftAssessment.id, draftAssessment);

    const completeAssessment: AssessmentSummary = {
      id: uuidv4(),
      name: 'CIS v8 Operational Review',
      frameworkIds: ['cis-v8'],
      status: 'complete',
      owner: 'automation@example.com',
      createdAt: now,
      updatedAt: now,
      progress: {
        satisfied: 153,
        partial: 0,
        unsatisfied: 0,
        total: 153
      }
    };

    this.assessments.set(completeAssessment.id, completeAssessment);
  }

  async list(): Promise<AssessmentSummary[]> {
    return Array.from(this.assessments.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  async create(payload: Pick<AssessmentSummary, 'name' | 'frameworkIds' | 'owner'>) {
    const now = new Date().toISOString();
    const record: AssessmentSummary = {
      id: uuidv4(),
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      progress: {
        satisfied: 0,
        partial: 0,
        unsatisfied: 0,
        total: 0
      },
      ...payload
    };

    this.assessments.set(record.id, record);
    return record;
  }

  async updateStatus(id: string, status: AssessmentStatus): Promise<AssessmentSummary> {
    const assessment = this.assessments.get(id);

    if (!assessment) {
      throw new Error(`Assessment ${id} not found`);
    }

    const updated: AssessmentSummary = {
      ...assessment,
      status,
      updatedAt: new Date().toISOString()
    };

    this.assessments.set(id, updated);
    return updated;
  }
}
