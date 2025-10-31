import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type FrameworkSummary = {
  id: string;
  name: string;
  version: string;
  description: string;
  family: 'NIST' | 'CIS' | 'PCI' | 'Custom';
  controlCount: number;
};

const fallback: FrameworkSummary[] = [
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
  }
];

export const useFrameworks = () =>
  useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => {
      const response = await apiClient.get<FrameworkSummary[]>('/frameworks');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: fallback,
    retry: false
  });
