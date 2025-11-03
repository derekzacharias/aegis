import { fireEvent, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AssessmentsPage from './assessments';
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessmentStatus,
  useAssessmentDetail,
  useUpdateAssessment,
  useUpdateAssessmentControl,
  useCreateAssessmentTask,
  useUpdateAssessmentTask,
  useDeleteAssessmentTask
} from '../hooks/use-assessments';
import { useFrameworks } from '../hooks/use-frameworks';
import { useAssessmentEvidenceReuse } from '../hooks/use-assessment-evidence-reuse';

jest.mock('../hooks/use-assessments');
jest.mock('../hooks/use-frameworks');
jest.mock('../hooks/use-assessment-evidence-reuse');

const mockUseAssessments = useAssessments as jest.Mock;
const mockUseCreateAssessment = useCreateAssessment as jest.Mock;
const mockUseUpdateAssessmentStatus = useUpdateAssessmentStatus as jest.Mock;
const mockUseAssessmentDetail = useAssessmentDetail as jest.Mock;
const mockUseUpdateAssessment = useUpdateAssessment as jest.Mock;
const mockUseUpdateAssessmentControl = useUpdateAssessmentControl as jest.Mock;
const mockUseCreateAssessmentTask = useCreateAssessmentTask as jest.Mock;
const mockUseUpdateAssessmentTask = useUpdateAssessmentTask as jest.Mock;
const mockUseDeleteAssessmentTask = useDeleteAssessmentTask as jest.Mock;
const mockUseFrameworks = useFrameworks as jest.Mock;
const mockUseAssessmentEvidenceReuse = useAssessmentEvidenceReuse as jest.Mock;

const frameworkFixtures = [
  {
    id: 'iso-27001-2022',
    slug: 'iso-27001-2022',
    name: 'ISO/IEC 27001',
    version: '2022',
    description: 'ISMS requirements.',
    family: 'ISO',
    status: 'PUBLISHED',
    isCustom: false,
    controlCount: 93,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    publishedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'iso-27002-2022',
    slug: 'iso-27002-2022',
    name: 'ISO/IEC 27002',
    version: '2022',
    description: 'Control implementation guidance.',
    family: 'ISO',
    status: 'PUBLISHED',
    isCustom: false,
    controlCount: 93,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    publishedAt: '2024-01-01T00:00:00.000Z'
  }
];

describe('AssessmentsPage', () => {
  beforeEach(() => {
    mockUseAssessments.mockReturnValue({ data: [], isLoading: false });
    mockUseCreateAssessment.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    mockUseUpdateAssessmentStatus.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    mockUseAssessmentDetail.mockReturnValue({ data: undefined, isLoading: false, isFetching: false });
    mockUseUpdateAssessment.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    mockUseUpdateAssessmentControl.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    mockUseCreateAssessmentTask.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    mockUseUpdateAssessmentTask.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    mockUseDeleteAssessmentTask.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    mockUseFrameworks.mockReturnValue({ data: frameworkFixtures, isLoading: false, isError: false });
    mockUseAssessmentEvidenceReuse.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null
    });
  });

  it('surfaces ISO frameworks in the assessment create modal', async () => {
    render(
      <ChakraProvider>
        <AssessmentsPage />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Launch Assessment/i }));

    const iso27001Checkbox = await screen.findByLabelText('ISO/IEC 27001 · 2022');
    const iso27002Checkbox = await screen.findByLabelText('ISO/IEC 27002 · 2022');

    expect(iso27001Checkbox).toBeInTheDocument();
    expect(iso27002Checkbox).toBeInTheDocument();

    fireEvent.click(iso27001Checkbox);
    expect((iso27001Checkbox as HTMLInputElement).checked).toBe(true);
  });
});
