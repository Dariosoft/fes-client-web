import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { IdentifiedSession, IdentitySession } from './types';

export type IdentityUiStatus = 'loading' | 'anonymous' | 'identified';

export type IdentityState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'identified'; displayName: string; email: string };

export type IdentityContextValue = {
  state: IdentityState;
  loginFailedNotice: string | null;
  setSession: (session: IdentitySession) => void;
  setLoading: () => void;
  setAnonymous: () => void;
  setIdentified: (session: IdentifiedSession) => void;
  showLoginFailedNotice: (message: string) => void;
  clearLoginFailedNotice: () => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

function toIdentityState(session: IdentitySession): IdentityState {
  if (session.status === 'identified') {
    return {
      status: 'identified',
      displayName: session.displayName,
      email: session.email,
    };
  }
  return { status: 'anonymous' };
}

export function IdentityProvider({
  children,
  initialState = { status: 'loading' },
}: {
  children: ReactNode;
  initialState?: IdentityState;
}) {
  const [state, setState] = useState<IdentityState>(initialState);
  const [loginFailedNotice, setLoginFailedNotice] = useState<string | null>(
    null,
  );

  const setSession = useCallback((session: IdentitySession) => {
    setState(toIdentityState(session));
  }, []);

  const setLoading = useCallback(() => {
    setState({ status: 'loading' });
  }, []);

  const setAnonymous = useCallback(() => {
    setState({ status: 'anonymous' });
  }, []);

  const setIdentified = useCallback((session: IdentifiedSession) => {
    setState({
      status: 'identified',
      displayName: session.displayName,
      email: session.email,
    });
  }, []);

  const showLoginFailedNotice = useCallback((message: string) => {
    setLoginFailedNotice(message);
  }, []);

  const clearLoginFailedNotice = useCallback(() => {
    setLoginFailedNotice(null);
  }, []);

  const value = useMemo<IdentityContextValue>(
    () => ({
      state,
      loginFailedNotice,
      setSession,
      setLoading,
      setAnonymous,
      setIdentified,
      showLoginFailedNotice,
      clearLoginFailedNotice,
    }),
    [
      state,
      loginFailedNotice,
      setSession,
      setLoading,
      setAnonymous,
      setIdentified,
      showLoginFailedNotice,
      clearLoginFailedNotice,
    ],
  );

  return (
    <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const value = useContext(IdentityContext);
  if (!value) {
    throw new Error('useIdentity must be used within IdentityProvider');
  }
  return value;
}
