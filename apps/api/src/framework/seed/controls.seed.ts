import { ControlDefinition } from '../framework.types';
import { nist80053Rev5Controls } from './nist-800-53-controls';

const otherFrameworkControls: ControlDefinition[] = [
  {
    id: 'cis-4-1',
    frameworkId: 'cis-v8',
    kind: 'base',
    family: 'Continuous Vulnerability Management',
    title: 'Establish and Maintain a Vulnerability Management Process',
    description:
      'Establish and maintain a documented vulnerability management program that includes scanning, reporting, and remediation.',
    priority: 'P2',
    keywords: ['vulnerability', 'scanning', 'remediation', 'patching', 'reporting']
  },
  {
    id: 'pci-8-2-6',
    frameworkId: 'pci-dss-4-0',
    kind: 'base',
    family: 'Identification and Authentication',
    title: 'User Authentication Processes and Procedures',
    description: 'Ensure strong authentication policies are implemented for user access to cardholder data.',
    priority: 'P0',
    keywords: ['authentication', 'password', 'access control', 'identity verification']
  }
];

export const controls: ControlDefinition[] = [...nist80053Rev5Controls, ...otherFrameworkControls];
