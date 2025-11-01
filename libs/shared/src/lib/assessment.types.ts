export type AssessmentStatus = 'draft' | 'in-progress' | 'complete';

export interface AssessmentProgress {
  satisfied: number;
  partial: number;
  unsatisfied: number;
  total: number;
}

export interface AssessmentSummary {
  id: string;
  name: string;
  frameworkIds: string[];
  status: AssessmentStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
  progress: AssessmentProgress;
}

export interface AssessmentControl {
  id: string;
  controlId: string;
  status: 'satisfied' | 'partial' | 'unsatisfied' | 'not-applicable';
  comments?: string;
  evidenceIds: string[];
  owner: string;
  dueDate?: string;
}
