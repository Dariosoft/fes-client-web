import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSession } from './get-session';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('getSession', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('gets and validates the account session with credentials', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ authenticated: false }));

    await expect(getSession()).resolves.toEqual({ authenticated: false });
    expect(fetchMock).toHaveBeenCalledWith('http://api.friendly-e-shop.test/accounts/session', {
      credentials: 'include',
    });
  });

  it('rejects an invalid response payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ authenticated: true }));

    await expect(getSession()).rejects.toThrow('Session response shape is invalid');
  });

  it('rejects a failed request', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 503));

    await expect(getSession()).rejects.toThrow('Session request failed with status 503');
  });
});
