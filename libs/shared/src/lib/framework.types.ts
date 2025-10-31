export type FrameworkFamily = 'NIST' | 'CIS' | 'PCI' | 'Custom';

export interface FrameworkSummary {
  id: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily;
  controlCount: number;
}

export interface ControlReference {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export interface ControlMapping {
  id: string;
  sourceControlId: string;
  targetControlId: string;
  confidence: number;
  rationale: string;
}
