import { ControlMappingSeed } from '../framework.types';
import { isoCrosswalkMappings } from './iso-270-controls';

export const controlMappings: ControlMappingSeed[] = [
  {
    sourceControlId: 'ra-5',
    targetControlId: 'cis-4-1',
    confidence: 0.82,
    tags: ['vulnerability-scanning', 'patch-management', 'continuous-monitoring'],
    origin: 'SEED',
    rationale:
      'Baseline mapping referencing NIST SP 800-53 RA-5 guidance against CIS v8 Control 4.1 vulnerability management expectations.',
    evidenceHints: [
      {
        evidenceId: 'evidence-ra5-monthly-scan',
        summary: 'Monthly authenticated vulnerability scan report with remediation tracking',
        rationale: 'Demonstrates scanning cadence and remediation workflow alignment across frameworks.',
        score: 0.8
      }
    ]
  },
  {
    sourceControlId: 'ia-2',
    targetControlId: 'pci-8-2-6',
    confidence: 0.78,
    tags: ['authentication', 'identity', 'privileged-access'],
    origin: 'SEED',
    rationale:
      'Crosswalk between organizational user authentication requirements in NIST IA-2 and PCI DSS 8.2.6 multi-factor mandates.',
    evidenceHints: [
      {
        evidenceId: 'evidence-privileged-mfa-policy',
        summary: 'Privileged MFA enrollment roster with enforcement screenshots',
        rationale: 'Shows strong authentication enforcement to satisfy both frameworks.',
        score: 0.75
      }
    ]
  },
  ...isoCrosswalkMappings
];
