import { getApiBaseUrl } from '../../../shared/config/api-base-url';
import type { AccountSessionResponse } from '../types';

function isAccountSessionResponse(value: unknown): value is AccountSessionResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (record.authenticated === false) {
    return true;
  }

  return (
    record.authenticated === true &&
    typeof record.id === 'string' &&
    typeof record.email === 'string' &&
    typeof record.name === 'string'
  );
}

export async function getSession(): Promise<AccountSessionResponse> {
  const response = await fetch(`${getApiBaseUrl()}/accounts/session`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Session request failed with status ${String(response.status)}`);
  }

  const payload: unknown = await response.json();

  if (!isAccountSessionResponse(payload)) {
    throw new Error('Session response shape is invalid');
  }

  return payload;
}
