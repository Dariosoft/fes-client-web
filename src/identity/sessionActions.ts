import { logout as logoutFromAccounts } from './logout';
import { fetchCurrentSession } from './session';
import type { IdentitySession } from './types';

/**
 * After a successful return from the accounts login flow, re-read the session
 * from accounts (source of truth) instead of caching a local profile.
 */
export async function refreshSessionAfterLogin(): Promise<IdentitySession> {
  return fetchCurrentSession();
}

/**
 * Logs out via accounts and returns the resulting anonymous session state.
 * Does not keep a local identity cache as if still signed in.
 */
export async function logoutAndClearSession(): Promise<IdentitySession> {
  await logoutFromAccounts();
  return { status: 'anonymous' };
}
