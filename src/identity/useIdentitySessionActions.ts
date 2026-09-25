import { useCallback } from 'react';
import { useIdentity } from './IdentityContext';
import {
  logoutAndClearSession,
  refreshSessionAfterLogin,
} from './sessionActions';

/**
 * Hooks that apply accounts responses into in-memory identity state.
 */
export function useIdentitySessionActions() {
  const { setSession, setAnonymous } = useIdentity();

  const applySuccessfulLogin = useCallback(async () => {
    const session = await refreshSessionAfterLogin();
    setSession(session);
    return session;
  }, [setSession]);

  const applySuccessfulLogout = useCallback(async () => {
    await logoutAndClearSession();
    setAnonymous();
    return { status: 'anonymous' as const };
  }, [setAnonymous]);

  return { applySuccessfulLogin, applySuccessfulLogout };
}
