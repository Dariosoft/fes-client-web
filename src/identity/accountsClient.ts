const ACCOUNTS_PATH = '/accounts';

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (typeof configured === 'string' && configured.trim().length > 0) {
    return configured.replace(/\/$/, '');
  }
  return 'http://api.friendly-e-shop.test';
}

/**
 * Builds a URL under the public `/accounts` path of the accounts service.
 * Never targets panel-api or other identity backends.
 */
export function accountsUrl(path = ''): string {
  const normalizedPath = path.startsWith('/') ? path : path ? `/${path}` : '';
  return `${resolveApiBaseUrl()}${ACCOUNTS_PATH}${normalizedPath}`;
}

/** Browser credentials for the shared session cookie owned by accounts. */
export const accountsFetchInit: RequestInit = {
  credentials: 'include',
};
