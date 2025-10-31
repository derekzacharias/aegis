import { FrameworkFamily } from '@prisma/client';

export const frameworks = [
  {
    id: 'nist-800-53-rev5',
    name: 'NIST SP 800-53',
    version: 'Rev 5',
    description: 'Security and Privacy Controls for Information Systems and Organizations.',
    family: FrameworkFamily.NIST,
    controlCount: 410
  },
  {
    id: 'nist-csf-2-0',
    name: 'NIST Cybersecurity Framework',
    version: '2.0',
    description: 'Framework for improving critical infrastructure cybersecurity.',
    family: FrameworkFamily.NIST,
    controlCount: 106
  },
  {
    id: 'cis-v8',
    name: 'CIS Critical Security Controls',
    version: '8',
    description: 'Prioritized set of safeguards to mitigate the most pervasive attacks.',
    family: FrameworkFamily.CIS,
    controlCount: 153
  },
  {
    id: 'pci-dss-4-0',
    name: 'PCI DSS',
    version: '4.0',
    description: 'Payment Card Industry Data Security Standard.',
    family: FrameworkFamily.PCI,
    controlCount: 280
  }
] satisfies Array<{
  id: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily;
  controlCount: number;
}>;
