import { useQuery } from '@tanstack/react-query';
import type { FrameworkSummary as SharedFrameworkSummary } from '@compliance/shared';
import apiClient from '../services/api-client';

export type FrameworkSummary = SharedFrameworkSummary;

const FALLBACK_TIMESTAMP = '1970-01-01T00:00:00.000Z';

const fallback: FrameworkSummary[] = [
  {
    id: 'nist-800-53-rev5',
    slug: 'nist-800-53-rev5',
    name: 'NIST SP 800-53',
    version: 'Rev 5',
    description: 'Security and Privacy Controls for Information Systems and Organizations.',
    family: 'NIST',
    status: 'PUBLISHED',
    isCustom: false,
    controlCount: 410,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
    publishedAt: FALLBACK_TIMESTAMP
  },
  {
    id: 'nist-csf-2-0',
    slug: 'nist-csf-2-0',
    name: 'NIST Cybersecurity Framework',
    version: '2.0',
    description: 'Framework for improving critical infrastructure cybersecurity.',
    family: 'NIST',
    status: 'PUBLISHED',
    isCustom: false,
    controlCount: 106,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
    publishedAt: FALLBACK_TIMESTAMP
  },
  {
    id: 'cis-v8',
    slug: 'cis-v8',
    name: 'CIS Critical Security Controls',
    version: '8',
    description: 'Prioritized set of safeguards to mitigate the most pervasive attacks.',
    family: 'CIS',
    status: 'PUBLISHED',
    isCustom: false,
    controlCount: 153,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
    publishedAt: FALLBACK_TIMESTAMP
  },
  {
    id: 'pci-dss-4-0',
    slug: 'pci-dss-4-0',
    name: 'PCI DSS',
    version: '4.0',
    description: 'Payment Card Industry Data Security Standard.',
    family: 'PCI',
    status: 'PUBLISHED',
    isCustom: false,
    controlCount: 280,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
    publishedAt: FALLBACK_TIMESTAMP
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
