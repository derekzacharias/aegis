import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthTokens, UserProfile } from '@compliance/shared';
import ProfileSettings from './profile-settings';
import useProfile from '../../hooks/use-profile';
import useAuth from '../../hooks/use-auth';

jest.mock('../../hooks/use-profile');
jest.mock('../../hooks/use-auth');

const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const profile: UserProfile = {
  id: 'user-1',
  email: 'analyst@example.com',
  firstName: 'Cyra',
  lastName: 'Analyst',
  jobTitle: 'Security Analyst',
  phoneNumber: '+1 555-0100',
  timezone: 'America/New_York',
  avatarUrl: '',
  bio: 'Keeps frameworks organised',
  role: 'ANALYST',
  organizationId: 'org-1',
  lastLoginAt: '2024-01-02T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z'
};

const renderComponent = () =>
  render(
    <ChakraProvider>
      <ProfileSettings />
    </ChakraProvider>
  );

type MockAuthValue = {
  user: UserProfile;
  tokens: AuthTokens;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: jest.Mock;
  logout: jest.Mock;
  setSession: jest.Mock;
  clearSession: jest.Mock;
  clearAuthError: jest.Mock;
  authError: string | null;
  refreshToken?: string;
};

const buildAuthValue = (overrides: Partial<MockAuthValue> = {}): MockAuthValue => ({
  user: profile,
  tokens: {
    accessToken: 'token',
    accessTokenExpiresIn: 900,
    refreshToken: 'refresh',
    refreshTokenExpiresIn: 604800
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  setSession: jest.fn(),
  clearSession: jest.fn(),
  clearAuthError: jest.fn(),
  authError: null,
  refreshToken: 'refresh',
  ...overrides
});

describe('ProfileSettings', () => {
  const updateProfile = jest.fn().mockResolvedValue(profile);
  const changePassword = jest.fn().mockResolvedValue(undefined);
  const loadAudits = jest.fn().mockResolvedValue([]);
  const updateRole = jest.fn().mockResolvedValue({ ...profile, role: 'ADMIN' });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseProfile.mockReturnValue({
      profile,
      audits: [],
      isLoading: false,
      isUpdating: false,
      reloadProfile: jest.fn(),
      updateProfile,
      changePassword,
      loadAudits,
      updateRole
    });

    mockUseAuth.mockReturnValue(buildAuthValue() as unknown as ReturnType<typeof useAuth>);
  });

  it('renders profile details', () => {
    renderComponent();

    expect(screen.getByLabelText(/First name/i)).toHaveValue('Cyra');
    expect(screen.getByLabelText(/Timezone/i)).toHaveValue('America/New_York');
    expect(screen.getByText(/Last login/i)).toBeInTheDocument();
  });

  it('submits profile changes', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Job title/i), {
      target: { value: 'Lead Analyst' }
    });

    fireEvent.submit(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ jobTitle: 'Lead Analyst' })));
  });

  it('submits password changes', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: 'Password!123' }
    });

    const [newPasswordField] = screen.getAllByLabelText(/New password/i);
    fireEvent.change(newPasswordField, {
      target: { value: 'NewPassword!123' }
    });

    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: 'NewPassword!123' }
    });

    fireEvent.submit(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith({
        currentPassword: 'Password!123',
        newPassword: 'NewPassword!123'
      })
    );
  });

  it('loads audits when history is expanded', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /show audit history/i }));

    await waitFor(() => expect(loadAudits).toHaveBeenCalled());
  });

  it('allows administrators to update role', async () => {
    mockUseAuth.mockReturnValue(
      buildAuthValue({ user: { ...profile, role: 'ADMIN' } }) as unknown as ReturnType<typeof useAuth>
    );

    renderComponent();

    const roleSelect = await screen.findByTestId('role-select');
    fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });

    await waitFor(() => expect(updateRole).toHaveBeenCalledWith('ADMIN'));
  });
});
