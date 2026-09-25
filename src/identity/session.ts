import { accountsFetchInit, accountsUrl } from './accountsClient';
import type { IdentitySession } from './types';

type MeResponseBody = {
  displayName?: unknown;
  name?: unknown;
  email?: unknown;
  authenticated?: unknown;
};

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function parseIdentified(body: MeResponseBody): IdentitySession | null {
  if (body.authenticated === false) {
    return { status: 'anonymous' };
  }

  const displayName = readString(body.displayName) ?? readString(body.name);
  const email = readString(body.email);

  if (displayName && email) {
    return { status: 'identified', displayName, email };
  }

  if (body.authenticated === true) {
    return null;
  }

  return null;
}

/**
 * Consults the accounts service for the current shared session (“quién soy”).
 * Returns anonymous when there is no active session.
 */
export async function fetchCurrentSession(): Promise<IdentitySession> {
  const response = await fetch(accountsUrl('/me'), {
    ...accountsFetchInit,
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (response.status === 401 || response.status === 403) {
    return { status: 'anonymous' };
  }

  if (!response.ok) {
    return { status: 'anonymous' };
  }

  const body = (await response.json()) as MeResponseBody;
  const parsed = parseIdentified(body);
  if (parsed) {
    return parsed;
  }

  return { status: 'anonymous' };
}
