export type FrameworkFamily = 'NIST' | 'CIS' | 'PCI' | 'Custom';

export type ControlPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type BaselineLevel = 'low' | 'moderate' | 'high';

export type ControlDefinition = {
  id: string;
  frameworkId: string;
  kind: 'base' | 'enhancement';
  parentId?: string;
  family: string;
  title: string;
  description: string;
  priority: ControlPriority;
  baselines?: BaselineLevel[];
  keywords?: string[];
  references?: string[];
  relatedControls?: string[];
};
