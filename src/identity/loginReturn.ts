export type LoginReturnOutcome = 'success' | 'failed' | 'none';

const FAILED_VALUES = new Set(['failed', 'fail', 'error', 'cancelled', 'canceled']);

/**
 * Reads accounts login return signals from the current URL search params.
 * Does not invent OAuth; only interprets return markers from the accounts flow.
 */
export function readLoginReturnOutcome(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): LoginReturnOutcome {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const login = params.get('login') ?? params.get('auth');

  if (!login) {
    return 'none';
  }

  const normalized = login.trim().toLowerCase();
  if (FAILED_VALUES.has(normalized)) {
    return 'failed';
  }

  if (normalized === 'success' || normalized === 'ok') {
    return 'success';
  }

  return 'none';
}

export function stripLoginReturnParams(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): string {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  params.delete('login');
  params.delete('auth');
  const next = params.toString();
  return next ? `?${next}` : '';
}
