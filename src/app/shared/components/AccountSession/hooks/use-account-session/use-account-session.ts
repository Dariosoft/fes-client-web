import { useEffect, useState } from 'react';
import { getSession } from '../../../../api/account/get-session/get-session';
import { postLogout } from '../../../../api/account/post-logout/post-logout';
import type { AccountSessionResponse } from '../../../../api/account/types';
import {
  SESSION_NOTICE,
  SESSION_STATUS,
  type SessionNotice,
  type SessionStatus,
} from '../../constants';
import { consumeLoginErrorFromUrl } from '../../lib/login-error-from-url/login-error-from-url';

export type { SessionNotice, SessionStatus } from '../../constants';

export type AuthenticatedAccount = Extract<AccountSessionResponse, { authenticated: true }>;

export type AccountSessionState = {
  status: SessionStatus;
  account: AuthenticatedAccount | null;
  notice: SessionNotice | null;
  logout: () => Promise<void>;
};

export function useAccountSession(): AccountSessionState {
  const [status, setStatus] = useState<SessionStatus>(SESSION_STATUS.loading);
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
          setStatus(SESSION_STATUS.authenticated);
          setNotice(null);
          return;
        }

        setAccount(null);
        setStatus(SESSION_STATUS.anonymous);
        setNotice(hadLoginError ? SESSION_NOTICE.loginFailed : null);
      } catch {
        if (cancelled) {
          return;
        }

        setAccount(null);
        setStatus(SESSION_STATUS.unreachable);
        setNotice(
          hadLoginError ? SESSION_NOTICE.loginFailed : SESSION_NOTICE.sessionUnreachable,
        );
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
    setStatus(SESSION_STATUS.anonymous);
    setNotice(null);
  }

  return { status, account, notice, logout };
}
