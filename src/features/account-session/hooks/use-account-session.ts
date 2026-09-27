import { useEffect, useState } from 'react';
import { getSession } from '../api/get-session';
import { postLogout } from '../api/post-logout';
import { consumeLoginErrorFromUrl } from '../lib/login-error-from-url';
import type { AccountSessionResponse } from '../types';

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated' | 'unreachable';

export type SessionNotice = 'session-unreachable' | 'login-failed';

export type AuthenticatedAccount = Extract<AccountSessionResponse, { authenticated: true }>;

export type AccountSessionState = {
  status: SessionStatus;
  account: AuthenticatedAccount | null;
  notice: SessionNotice | null;
  logout: () => Promise<void>;
};

export function useAccountSession(): AccountSessionState {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [account, setAccount] = useState<AuthenticatedAccount | null>(null);
  const [notice, setNotice] = useState<SessionNotice | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const hadLoginError = consumeLoginErrorFromUrl();

      try {
        const session = await getSession();

        if (cancelled) {
          return;
        }

        if (session.authenticated) {
          setAccount(session);
          setStatus('authenticated');
          setNotice(null);
          return;
        }

        setAccount(null);
        setStatus('anonymous');
        setNotice(hadLoginError ? 'login-failed' : null);
      } catch {
        if (cancelled) {
          return;
        }

        setAccount(null);
        setStatus('unreachable');
        setNotice(hadLoginError ? 'login-failed' : 'session-unreachable');
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function logout(): Promise<void> {
    await postLogout();
    setAccount(null);
    setStatus('anonymous');
    setNotice(null);
  }

  return { status, account, notice, logout };
}
