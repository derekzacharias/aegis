import { FrameworkFamily } from '../framework.types';
import { ISO_CONTROL_COUNT } from './iso-270-controls';

export const frameworks = [
  {
    id: 'nist-800-53-rev5',
    name: 'NIST SP 800-53',
    version: 'Rev 5',
    description: 'Security and Privacy Controls for Information Systems and Organizations.',
    family: 'NIST',
    controlCount: 410
  },
  {
    id: 'nist-csf-2-0',
    name: 'NIST Cybersecurity Framework',
    version: '2.0',
    description: 'Framework for improving critical infrastructure cybersecurity.',
    family: 'NIST',
    controlCount: 106
  },
  {
    id: 'cis-v8',
    name: 'CIS Critical Security Controls',
    version: '8',
    description: 'Prioritized set of safeguards to mitigate the most pervasive attacks.',
    family: 'CIS',
    controlCount: 153
  },
  {
    id: 'pci-dss-4-0',
    name: 'PCI DSS',
    version: '4.0',
    description: 'Payment Card Industry Data Security Standard.',
    family: 'PCI',
    controlCount: 280
  },
  {
    id: 'iso-27001-2022',
    name: 'ISO/IEC 27001',
    version: '2022',
    description: 'Information security, cybersecurity and privacy protection — Information security management systems.',
    family: 'ISO',
    controlCount: ISO_CONTROL_COUNT
  },
  {
    id: 'iso-27002-2022',
    name: 'ISO/IEC 27002',
    version: '2022',
    description: 'Information security, cybersecurity and privacy protection — Information security controls.',
    family: 'ISO',
    controlCount: ISO_CONTROL_COUNT
  }
] satisfies Array<{
  id: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily;
  controlCount: number;
}>;
