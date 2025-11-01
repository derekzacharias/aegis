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

  const raw = window.localStorage.getItem(storageKey);
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
    if (isBrowser) {
      window.localStorage.setItem(storageKey, JSON.stringify({ email: next.email }));
    }
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
  }, [persistActor]);

  useEffect(() => {
    void refreshParticipants();
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
