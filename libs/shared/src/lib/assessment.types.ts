export type AssessmentStatus = 'draft' | 'in-progress' | 'complete';

export type AssessmentControlStatus =
  | 'unassessed'
  | 'satisfied'
  | 'partial'
  | 'unsatisfied'
  | 'not-applicable';

export type AssessmentTaskStatus = 'open' | 'in-progress' | 'blocked' | 'complete';

export type AssessmentTaskPriority = 'low' | 'medium' | 'high' | 'critical';

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

export interface AssessmentFrameworkSummary {
  id: string;
  name: string;
  version: string;
}

export interface AssessmentTask {
  id: string;
  title: string;
  description?: string;
  status: AssessmentTaskStatus;
  priority: AssessmentTaskPriority;
  owner: string;
  dueDate?: string;
  assessmentControlId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentControl {
  id: string;
  controlId: string;
  title: string;
  frameworkId: string;
  frameworkName: string;
  status: AssessmentControlStatus;
  owner: string;
  dueDate?: string;
  comments?: string;
  tasks: AssessmentTask[];
  updatedAt: string;
}

export interface AssessmentControlSummary {
  id: string;
  assessmentId: string;
  controlId: string;
  title: string;
  frameworkId: string;
  frameworkName: string;
  family: string;
  status: AssessmentControlStatus;
  owner: string;
  dueDate?: string | null;
  comments?: string | null;
  updatedAt: string;
}

export interface AssessmentAuditEntry {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AssessmentDetail extends AssessmentSummary {
  frameworks: AssessmentFrameworkSummary[];
  controls: AssessmentControl[];
  tasks: AssessmentTask[];
  auditLog: AssessmentAuditEntry[];
}
