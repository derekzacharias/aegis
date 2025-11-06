export const ASSESSMENT_AUTOMATION_JOB = 'assessment.automation.execute';
export const ASSESSMENT_AUTOMATION_RESULT_JOB = 'assessment.automation.result';

export type AutomationExecutionMode = 'resident' | 'ssh' | 'winrm' | 'cloud';

export type AutomationTool =
  | 'inspec'
  | 'ansible'
  | 'powershell'
  | 'custom';

export interface AutomationTarget {
  id: string;
  hostname?: string;
  address?: string;
  labels?: string[];
  credentialAlias: string;
  transport?: AutomationExecutionMode;
}

export interface AssessmentAutomationJobPayload {
  assessmentId: string;
  frameworkIds: string[];
  executionMode: AutomationExecutionMode;
  tooling: AutomationTool[];
  targets: AutomationTarget[];
  requestedBy: {
    actorId: string;
    actorType: 'user' | 'service';
    organizationId: string;
  };
  options?: {
    concurrency?: number;
    timeoutSeconds?: number;
    dryRun?: boolean;
    notes?: string;
  };
  correlationId?: string;
}

export interface AssessmentAutomationJobResult {
  assessmentId: string;
  frameworkIds: string[];
  executionMode: AutomationExecutionMode;
  startedAt: string;
  completedAt: string;
  runId: string;
  success: boolean;
  failureReason?: string;
  targetsProcessed: number;
  evidenceIds?: string[];
  metadata?: Record<string, unknown>;
}
