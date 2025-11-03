export type FrameworkFamily = 'NIST' | 'CIS' | 'PCI' | 'ISO' | 'CUSTOM';

export type FrameworkStatus = 'DRAFT' | 'PUBLISHED';

export type ControlPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type BaselineLevel = 'low' | 'moderate' | 'high' | 'privacy';

export type ControlKind = 'base' | 'enhancement';

export type ControlMappingOrigin = 'SEED' | 'ALGO' | 'MANUAL';

export type ControlDefinition = {
  id: string;
  frameworkId: string;
  kind: ControlKind;
  parentId?: string;
  family: string;
  title: string;
  description: string;
  priority: ControlPriority;
  baselines?: BaselineLevel[];
  keywords?: string[];
  references?: string[];
  relatedControls?: string[];
  tags?: string[];
  metadata?: Record<string, unknown> | null;
};

export type ControlMappingSeed = {
  sourceControlId: string;
  targetControlId: string;
  confidence: number;
  tags?: string[];
  origin?: ControlMappingOrigin;
  rationale?: string;
  evidenceHints?: EvidenceReuseHintSeed[];
};

export type EvidenceReuseHintSeed = {
  evidenceId?: string;
  summary: string;
  rationale?: string;
  score?: number;
};

export type ControlReference = {
  id: string;
  frameworkId: string;
  title: string;
  family: string;
  metadata?: Record<string, unknown>;
};

export type EvidenceReuseHint = {
  id: string;
  summary: string;
  rationale?: string;
  score: number;
  evidenceId?: string;
};

export type CrosswalkMatchStatus = 'mapped' | 'suggested';

export type CrosswalkMatch = {
  id: string;
  source: ControlReference;
  target: ControlReference;
  confidence: number;
  origin: ControlMappingOrigin;
  tags: string[];
  rationale?: string;
  evidenceHints: EvidenceReuseHint[];
  status: CrosswalkMatchStatus;
  similarityBreakdown?: {
    score: number;
    matchedTerms: string[];
  };
};

export type CrosswalkResponse = {
  frameworkId: string;
  generatedAt: string;
  total: number;
  matches: CrosswalkMatch[];
  filters: {
    targetFrameworkId?: string;
    minConfidence?: number;
  };
};
