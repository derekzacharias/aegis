import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { PolicyParticipantGroups, PolicyUserSummary } from '@compliance/shared';
import apiClient from '../services/api-client';
import { safeStorage } from '../utils/safe-storage';

type PolicyActorOption = PolicyUserSummary;

type PolicyActorContextValue = {
  actor: PolicyActorOption | null;
  setActor: (actor: PolicyActorOption) => void;
  participants: PolicyParticipantGroups | null;
  refreshParticipants: () => Promise<void>;
};

const storageKey = 'aegis.policy.actor';

const PolicyActorContext = createContext<PolicyActorContextValue | undefined>(
  undefined
);

const defaultEmail = import.meta.env['VITE_POLICY_ACTOR_EMAIL'] ??
  'alex.mercier@example.com';

const isBrowser = typeof window !== 'undefined';

const readStoredActor = (): Pick<PolicyActorOption, 'email'> | null => {
  if (!isBrowser) {
    return null;
  }

  const raw = safeStorage.get(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Pick<PolicyActorOption, 'email'>;
    if (typeof parsed.email === 'string' && parsed.email.length > 3) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

export const PolicyActorProvider = ({ children }: { children: ReactNode }) => {
  const [actor, setActorState] = useState<PolicyActorOption | null>(null);
  const [participants, setParticipants] = useState<PolicyParticipantGroups | null>(null);
  const actorRef = useRef<PolicyActorOption | null>(null);

  const persistActor = useCallback((next: PolicyActorOption) => {
    actorRef.current = next;
    setActorState(next);
    safeStorage.set(storageKey, JSON.stringify({ email: next.email }));
  }, [actorRef]);

  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.request.use((config) => {
      const currentActor = actorRef.current;
      config.headers = config.headers ?? {};
      if (currentActor?.id) {
        config.headers['X-Actor-Id'] = currentActor.id;
      }
      if (currentActor?.email) {
        config.headers['X-Actor-Email'] = currentActor.email;
      }
      return config;
    });

    return () => {
      apiClient.interceptors.request.eject(interceptorId);
    };
  }, []);

  const refreshParticipants = useCallback(async () => {
    const storedEmail = readStoredActor()?.email ?? defaultEmail;

    try {
      const response = await apiClient.get<PolicyParticipantGroups>(
        '/policies/actors',
        {
          headers: {
            'X-Actor-Email': actorRef.current?.email ?? storedEmail
          }
        }
      );
      setParticipants(response.data);

      const combined = [...response.data.authors, ...response.data.approvers];
      const candidate = combined.find((item) => item.email === storedEmail) ?? combined[0];

      if (candidate) {
        persistActor(candidate);
      }
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load policy participants', error);
      return false;
    }
  }, [persistActor]);

  useEffect(() => {
    let cancelled = false;
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];
    const scheduleTimeout =
      typeof window !== 'undefined' ? window.setTimeout.bind(window) : setTimeout;
    const clearTimeoutFn =
      typeof window !== 'undefined' ? window.clearTimeout.bind(window) : clearTimeout;

    const attemptFetch = async (attempt = 0) => {
      const success = await refreshParticipants();
      if (!success) {
        if (cancelled) {
          return;
        }

        if (attempt >= 3) {
          return;
        }

        const delay = Math.min(1000 * (attempt + 1), 5000);
        const timeoutId = scheduleTimeout(() => {
          void attemptFetch(attempt + 1);
        }, delay);
        timeouts.push(timeoutId);
      }
    };

    void attemptFetch();

    return () => {
      cancelled = true;
      timeouts.forEach((timeoutId) => clearTimeoutFn(timeoutId));
    };
  }, [refreshParticipants]);

  const contextValue = useMemo<PolicyActorContextValue>(() => ({
    actor,
    setActor: persistActor,
    participants,
    refreshParticipants
  }), [actor, participants, persistActor, refreshParticipants]);

  return (
    <PolicyActorContext.Provider value={contextValue}>
      {children}
    </PolicyActorContext.Provider>
  );
};

export const usePolicyActor = (): PolicyActorContextValue => {
  const context = useContext(PolicyActorContext);
  if (!context) {
    throw new Error('usePolicyActor must be used within a PolicyActorProvider');
  }
  return context;
};
