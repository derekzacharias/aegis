import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { UserProfile, UserProfileAuditEntry, UserRole } from '@compliance/shared';
import apiClient from '../services/api-client';
import useAuth from '../hooks/use-auth';

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

type ProfileUpdateInput = Partial<
  Pick<UserProfile, 'firstName' | 'lastName' | 'jobTitle' | 'phoneNumber' | 'timezone' | 'avatarUrl' | 'bio'>
>;

type ProfileContextValue = {
  profile: UserProfile | null;
  audits: UserProfileAuditEntry[];
  isLoading: boolean;
  isUpdating: boolean;
  reloadProfile: () => Promise<UserProfile>;
  updateProfile: (updates: ProfileUpdateInput) => Promise<UserProfile>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  loadAudits: (limit?: number) => Promise<UserProfileAuditEntry[]>;
  updateRole: (role: UserRole, userId?: string) => Promise<UserProfile>;
};

export const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, tokens, setSession, clearSession, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [audits, setAudits] = useState<UserProfileAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const mergeSession = useCallback(
    (next: UserProfile) => {
      if (!tokens) {
        return;
      }

      setSession({
        user: next,
        tokens
      });
    },
    [setSession, tokens]
  );

  const reloadProfile = useCallback(async (): Promise<UserProfile> => {
    if (!isAuthenticated) {
      throw new Error('Cannot load profile when unauthenticated');
    }

    const { data } = await apiClient.get<UserProfile>('/users/me');
    setProfile(data);
    mergeSession(data);
    return data;
  }, [isAuthenticated, mergeSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setAudits([]);
      return;
    }

    setIsLoading(true);
    reloadProfile()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load profile', error);
        clearSession();
      })
      .finally(() => setIsLoading(false));
  }, [clearSession, isAuthenticated, reloadProfile]);

  const loadAudits = useCallback(async (limit = 20) => {
    const { data } = await apiClient.get<UserProfileAuditEntry[]>('/users/me/audits', {
      params: { limit }
    });
    setAudits(data);
    return data;
  }, []);

  const updateProfile = useCallback(
    async (updates: ProfileUpdateInput) => {
      if (!profile) {
        throw new Error('Profile is not loaded');
      }

      const optimistic = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      } as UserProfile;

      setProfile(optimistic);
      setIsUpdating(true);

      try {
        const { data } = await apiClient.patch<UserProfile>('/users/me', updates);
        setProfile(data);
        mergeSession(data);
        void loadAudits().catch(() => undefined);
        return data;
      } catch (error) {
        setProfile(profile);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [loadAudits, mergeSession, profile]
  );

  const changePassword = useCallback(async (input: ChangePasswordInput) => {
    await apiClient.patch('/users/me/password', input);
    void loadAudits().catch(() => undefined);
  }, [loadAudits]);

  const updateRole = useCallback(
    async (role: UserRole, userId?: string) => {
      if (!profile) {
        throw new Error('Profile is not loaded');
      }

      const targetId = userId ?? profile.id;
      const { data } = await apiClient.patch<UserProfile>(`/users/${targetId}/role`, {
        role
      });

      if (targetId === profile.id) {
        setProfile(data);
        mergeSession(data);
        void loadAudits().catch(() => undefined);
      }

      return data;
    },
    [loadAudits, mergeSession, profile]
  );

  useEffect(() => {
    if (profile) {
      return;
    }

    if (user?.id && isAuthenticated) {
      // Use the user payload from the auth session as a baseline until the profile endpoint resolves.
      setProfile({
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        jobTitle: user.jobTitle ?? null,
        phoneNumber: user.phoneNumber ?? null,
        timezone: user.timezone ?? null,
        avatarUrl: user.avatarUrl ?? null,
        bio: user.bio ?? null,
        role: user.role,
        organizationId: user.organizationId,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt ?? new Date().toISOString(),
        updatedAt: user.updatedAt ?? new Date().toISOString()
      });
    }
  }, [isAuthenticated, profile, user]);

  const value = useMemo<ProfileContextValue>(() => ({
    profile,
    audits,
    isLoading,
    isUpdating,
    reloadProfile,
    updateProfile,
    changePassword,
    loadAudits,
    updateRole
  }), [audits, changePassword, isLoading, isUpdating, loadAudits, profile, reloadProfile, updateProfile, updateRole]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
