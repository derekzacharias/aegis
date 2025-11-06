import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CustomFrameworkWizard from './custom-framework-wizard';
import type { FrameworkDetail } from '../hooks/use-custom-frameworks';
import type { FrameworkSummary } from '../hooks/use-frameworks';
import {
  useCreateFrameworkMutation,
  useFrameworkDetail,
  usePublishFrameworkMutation,
  useUpdateFrameworkMutation,
  useUpsertControlsMutation
} from '../hooks/use-custom-frameworks';

jest.mock('../hooks/use-custom-frameworks');

const mockUseFrameworkDetail = useFrameworkDetail as jest.Mock;
const mockUseCreateFrameworkMutation = useCreateFrameworkMutation as unknown as jest.Mock;
const mockUseUpdateFrameworkMutation = useUpdateFrameworkMutation as unknown as jest.Mock;
const mockUseUpsertControlsMutation = useUpsertControlsMutation as unknown as jest.Mock;
const mockUsePublishFrameworkMutation = usePublishFrameworkMutation as unknown as jest.Mock;

describe('CustomFrameworkWizard', () => {
  let createMutationMock: jest.Mock;
  let updateMutationMock: jest.Mock;
  let upsertMutationMock: jest.Mock;
  let publishMutationMock: jest.Mock;

  beforeEach(() => {
    mockUseFrameworkDetail.mockReturnValue({ data: undefined, isFetching: false });
    createMutationMock = jest.fn().mockResolvedValue({ id: 'framework-1' });
    updateMutationMock = jest.fn();
    upsertMutationMock = jest.fn().mockResolvedValue({});
    publishMutationMock = jest.fn().mockResolvedValue({});

    mockUseCreateFrameworkMutation.mockReturnValue({ mutateAsync: createMutationMock });
    mockUseUpdateFrameworkMutation.mockReturnValue({ mutateAsync: updateMutationMock });
    mockUseUpsertControlsMutation.mockReturnValue({ mutateAsync: upsertMutationMock });
    mockUsePublishFrameworkMutation.mockReturnValue({ mutateAsync: publishMutationMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new framework from details step', async () => {
    render(
      <ChakraProvider>
        <CustomFrameworkWizard isOpen onClose={jest.fn()} />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Privacy Baseline' } });
    fireEvent.change(screen.getByLabelText(/Version/i), { target: { value: '1.0' } });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Internal privacy baseline' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(createMutationMock).toHaveBeenCalledWith({
        name: 'Privacy Baseline',
        version: '1.0',
        description: 'Internal privacy baseline',
        family: 'CUSTOM',
        metadata: { wizard: { step: 'controls' } }
      });
    });

    expect(screen.getByText(/Add a control manually/i)).toBeInTheDocument();
  });

  it('adds controls and publishes framework', async () => {
    const onClose = jest.fn();
    createMutationMock.mockResolvedValue({ id: 'framework-1' });
    upsertMutationMock.mockResolvedValue({});

    render(
      <ChakraProvider>
        <CustomFrameworkWizard isOpen onClose={onClose} />
      </ChakraProvider>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Custom Zero Trust' } });
    fireEvent.change(screen.getByLabelText(/Version/i), { target: { value: '2024' } });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Baseline controls for zero trust adoption' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(createMutationMock).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Control Family/i), { target: { value: 'Access Control' } });
    await screen.findByText(/Add a control manually/i);

    const titleField = await screen.findByTestId('control-title-input');
    fireEvent.change(titleField, {
      target: { value: 'Multi-factor Authentication' }
    });
    const descriptionField = await screen.findByTestId('control-description-input');
    fireEvent.change(descriptionField, {
      target: { value: 'Require MFA for privileged access.' }
    });


    fireEvent.click(screen.getByRole('button', { name: /Add Control/i }));

    expect(screen.getByText(/1 controls in draft/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Review Controls/i }));

    await waitFor(() => {
      expect(upsertMutationMock).toHaveBeenCalledWith({
        frameworkId: 'framework-1',
        payload: {
          controls: [
            expect.objectContaining({
              family: 'Access Control',
              title: 'Multi-factor Authentication'
            })
          ]
        }
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

    fireEvent.click(screen.getByRole('button', { name: /Publish Framework/i }));

    await waitFor(() => {
      expect(publishMutationMock).toHaveBeenCalledWith({
        frameworkId: 'framework-1',
        payload: expect.any(Object)
      });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('loads existing draft details when editing a framework', async () => {
    const draft: FrameworkSummary = {
      id: 'framework-draft',
      slug: 'framework-draft',
      name: 'Draft Framework',
      version: '0.1',
      description: 'Work in progress',
      family: 'CUSTOM',
      status: 'DRAFT',
      isCustom: true,
      controlCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null
    };

    const detail: FrameworkDetail = {
      ...draft,
      controls: [
        {
          id: 'control-1',
          frameworkId: draft.id,
          family: 'Operations',
          title: 'Inventory assets',
          description: 'Maintain an inventory of assets.',
          priority: 'P2',
          kind: 'base',
          mappings: []
        }
      ]
    };

    mockUseFrameworkDetail.mockReturnValue({ data: detail, isFetching: false });

    render(
      <ChakraProvider>
        <CustomFrameworkWizard isOpen framework={draft} onClose={jest.fn()} />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Draft Framework')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('0.1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Work in progress')).toBeInTheDocument();
  });
});
