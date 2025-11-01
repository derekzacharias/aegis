export type FrameworkFamily = 'NIST' | 'CIS' | 'PCI' | 'CUSTOM';

export type FrameworkStatus = 'DRAFT' | 'PUBLISHED';

export type ControlPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type BaselineLevel = 'low' | 'moderate' | 'high' | 'privacy';

export type ControlKind = 'base' | 'enhancement';

export type ControlStatus = 'UNASSESSED' | 'SATISFIED' | 'PARTIAL' | 'UNSATISFIED' | 'NOT_APPLICABLE';

export type ControlMappingOrigin = 'SEED' | 'ALGO' | 'MANUAL';

export interface FrameworkSummary {
  id: string;
  slug: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily;
  status: FrameworkStatus;
  isCustom: boolean;
  controlCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface FrameworkControlMapping {
  id: string;
  targetControlId: string;
  targetControlTitle: string;
  targetFramework: {
    id: string;
    name: string;
    version: string;
  };
  confidence: number;
  origin: ControlMappingOrigin;
  tags: string[];
  rationale?: string;
}

export interface FrameworkControlDetail {
  id: string;
  frameworkId: string;
  family: string;
  title: string;
  description: string;
  priority: ControlPriority;
  kind?: ControlKind;
  parentId?: string | null;
  baselines?: BaselineLevel[];
  keywords?: string[];
  references?: string[];
  relatedControls?: string[];
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  mappings: FrameworkControlMapping[];
}

export interface FrameworkDetail extends FrameworkSummary {
  metadata?: Record<string, unknown>;
  controls: FrameworkControlDetail[];
}
