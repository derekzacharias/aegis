import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { AuthResponse, AuthTokens, AuthUser } from '@compliance/shared';
import apiClient from '../services/api-client';

type AuthState = {
  session?: AuthResponse | null;
  isLoading: boolean;
};

type AuthContextValue = {
  user?: AuthUser;
  tokens?: AuthTokens;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
  authError: string | null;
  clearAuthError: () => void;
};

const storageKey = 'aegis.auth.session';

const initialState: AuthState = {
  session: undefined,
  isLoading: true
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredSession = (): AuthResponse | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(storageKey);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthResponse;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [authError, setAuthError] = useState<string | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthResponse> | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const persistSession = useCallback((session: AuthResponse) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
    }

    setState({ session, isLoading: false });
    clearAuthError();
  }, [clearAuthError]);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }

    setState({ session: undefined, isLoading: false });
    clearAuthError();
  }, [clearAuthError]);

  const validateSession = useCallback(
    async (tokens: Pick<AuthTokens, 'accessToken'>) => {
      try {
        const { data } = await apiClient.get<AuthUser>('/auth/me', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`
          }
        });

        setState((prev) =>
          prev.session
            ? {
                session: {
                  ...prev.session,
                  user: data,
                  tokens: {
                    ...prev.session.tokens,
                    accessToken: tokens.accessToken
                  }
                },
                isLoading: false
              }
            : { session: undefined, isLoading: false }
        );
      } catch {
        clearSession();
      }
    },
    [clearSession]
  );

  useEffect(() => {
    const stored = readStoredSession();

    if (stored?.tokens?.accessToken) {
      setState({ session: stored, isLoading: true });
      void validateSession({ accessToken: stored.tokens.accessToken });
    } else {
      if (stored) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(storageKey);
        }
      }
      setState({ session: undefined, isLoading: false });
    }
  }, [validateSession]);

  const refreshSession = useCallback(async (): Promise<AuthResponse> => {
    const refreshToken = state.session?.tokens.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = axios
        .post<AuthResponse>('/api/auth/refresh', {
          refreshToken
        })
        .then((response) => {
          persistSession(response.data);
          return response.data;
        })
        .catch((error) => {
          clearSession();
          throw error;
        })
        .finally(() => {
          refreshPromiseRef.current = null;
        });
    }

    return refreshPromiseRef.current;
  }, [clearSession, persistSession, state.session?.tokens.refreshToken]);

  useEffect(() => {
    const requestId = apiClient.interceptors.request.use((config) => {
      const accessToken = state.session?.tokens.accessToken;
      if (accessToken) {
        config.headers = config.headers ?? {};
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
      }
      return config;
    });

    const responseId = apiClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
        const status = error.response?.status;

        if (status === 403) {
          setAuthError('You do not have permission to perform this action.');
        }

        const isAuthEndpoint =
          typeof originalRequest?.url === 'string' && originalRequest.url.includes('/auth/');

        if (
          status === 401 &&
          !isAuthEndpoint &&
          state.session?.tokens.refreshToken &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const refreshed = await refreshSession();
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers['Authorization'] = `Bearer ${refreshed.tokens.accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            clearSession();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestId);
      apiClient.interceptors.response.eject(responseId);
    };
  }, [clearSession, refreshSession, state.session?.tokens.accessToken, state.session?.tokens.refreshToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await axios.post<AuthResponse>('/api/auth/login', {
        email,
        password
      });
      persistSession(response.data);
      return response.data;
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore logout errors
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.session?.user,
      tokens: state.session?.tokens,
      isAuthenticated: Boolean(state.session?.user && state.session?.tokens.accessToken),
      isLoading: state.isLoading,
      login,
      logout,
      setSession: persistSession,
      clearSession,
      authError,
      clearAuthError
    }),
    [authError, clearAuthError, clearSession, login, logout, persistSession, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
