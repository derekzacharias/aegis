type ControlPriority = 'P0' | 'P1' | 'P2' | 'P3';

export const controls = [
  {
    id: 'ac-2',
    frameworkId: 'nist-800-53-rev5',
    family: 'Access Control',
    title: 'AC-2 Account Management',
    description:
      'Manage information system accounts, including identifying account types, establishing conditions for group and role membership, and monitoring account usage.',
    priority: 'P1'
  },
  {
    id: 'ac-17',
    frameworkId: 'nist-800-53-rev5',
    family: 'Access Control',
    title: 'AC-17 Remote Access',
    description: 'Establish and document usage restrictions, configuration requirements, and monitoring for remote access.',
    priority: 'P1'
  },
  {
    id: 'cis-4-1',
    frameworkId: 'cis-v8',
    family: 'Continuous Vulnerability Management',
    title: 'Establish and Maintain a Vulnerability Management Process',
    description:
      'Establish and maintain a documented vulnerability management program that includes scanning, reporting, and remediation.',
    priority: 'P2'
  },
  {
    id: 'pci-8-2-6',
    frameworkId: 'pci-dss-4-0',
    family: 'Identification and Authentication',
    title: 'User Authentication Processes and Procedures',
    description: 'Ensure strong authentication policies are implemented for user access to cardholder data.',
    priority: 'P0'
  }
] satisfies Array<{
  id: string;
  frameworkId: string;
  family: string;
  title: string;
  description: string;
  priority: ControlPriority;
}>;
