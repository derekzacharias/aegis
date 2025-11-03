import { fireEvent, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import FrameworksPage from './frameworks';
import { useDeleteFramework, useFrameworks } from '../hooks/use-frameworks';

jest.mock('../hooks/use-frameworks', () => ({
  useFrameworks: jest.fn(),
  useDeleteFramework: jest.fn()
}));
jest.mock('../components/custom-framework-wizard', () => () => null);

const mockUseFrameworks = useFrameworks as jest.Mock;
const mockUseDeleteFramework = useDeleteFramework as jest.Mock;

describe('FrameworksPage', () => {
  beforeEach(() => {
    mockUseDeleteFramework.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false
    });
    mockUseFrameworks.mockReturnValue({
      data: [
        {
          id: 'iso-27001-2022',
          slug: 'iso-27001-2022',
          name: 'ISO/IEC 27001',
          version: '2022',
          description:
            'Information security management system requirements for establishing, implementing, and improving an ISMS.',
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
          description: 'Implementation guidance for Annex A controls with example measures.',
          family: 'ISO',
          status: 'PUBLISHED',
          isCustom: false,
          controlCount: 93,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          publishedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      isLoading: false,
      isError: false
    });
  });

  it('renders ISO frameworks in the library', () => {
    render(
      <ChakraProvider>
        <FrameworksPage />
      </ChakraProvider>
    );

    expect(screen.getByText('ISO/IEC 27001')).toBeInTheDocument();
    expect(screen.getByText('ISO/IEC 27002')).toBeInTheDocument();
    expect(screen.getAllByText('ISO')).toHaveLength(2);
  });

  it('shows remove option for custom frameworks', () => {
    mockUseFrameworks.mockReturnValueOnce({
      data: [
        {
          id: 'custom-1',
          slug: 'custom-1',
          name: 'Custom Baseline',
          version: '1.0',
          description: 'Internal controls',
          family: 'CUSTOM',
          status: 'DRAFT',
          isCustom: true,
          controlCount: 5,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          publishedAt: null
        }
      ],
      isLoading: false,
      isError: false
    });

    render(
      <ChakraProvider>
        <FrameworksPage />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByLabelText('Framework options'));
    expect(screen.getByText('Remove framework')).toBeInTheDocument();
  });
});
