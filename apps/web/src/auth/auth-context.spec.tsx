import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { ReactNode } from 'react';
import apiClient from '../services/api-client';
import { AuthProvider } from './auth-context';
import useAuth from '../hooks/use-auth';

const TestConsumer = () => {
  const { login, logout, user, isAuthenticated } = useAuth();

  const handleLogin = () => {
    void login('analyst@example.com', 'Password!234');
  };

  const handleLogout = () => {
    void logout();
  };

  return (
    <div>
      <button onClick={handleLogin}>login</button>
      <button onClick={handleLogout}>logout</button>
      <span data-testid="auth-state">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user-email">{user?.email ?? 'none'}</span>
    </div>
  );
};

const renderWithProvider = (children: ReactNode) =>
  render(<AuthProvider>{children}</AuthProvider>);

describe('AuthProvider', () => {
  const storageKey = 'aegis.auth.session';

  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('stores session data on login', async () => {
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'analyst@example.com',
          firstName: 'Analyst',
          lastName: 'User',
          jobTitle: 'Security Analyst',
          timezone: 'America/New_York',
          role: 'ANALYST',
          organizationId: 'org-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        tokens: {
          accessToken: 'token-123',
          accessTokenExpiresIn: 900,
          refreshToken: 'refresh-123',
          refreshTokenExpiresIn: 604800
        }
      }
    });

    renderWithProvider(<TestConsumer />);

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('auth-state')).toHaveTextContent('yes'));
    expect(screen.getByTestId('user-email').textContent).toBe('analyst@example.com');
    expect(window.localStorage.getItem(storageKey)).toContain('token-123');
  });

  it('clears session on logout', async () => {
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'analyst@example.com',
          role: 'ANALYST',
          organizationId: 'org-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        tokens: {
          accessToken: 'token-123',
          accessTokenExpiresIn: 900,
          refreshToken: 'refresh-123',
          refreshTokenExpiresIn: 604800
        }
      }
    });

    jest.spyOn(apiClient, 'post').mockResolvedValue({ data: { success: true } });

    renderWithProvider(<TestConsumer />);

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('auth-state')).toHaveTextContent('yes'));

    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('auth-state')).toHaveTextContent('no'));
    expect(screen.getByTestId('user-email').textContent).toBe('none');
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
