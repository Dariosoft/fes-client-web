import { afterEach, describe, expect, it, vi } from 'vitest';
import { postLogout } from './post-logout';

describe('postLogout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('posts logout with credentials', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));

    await postLogout();

    expect(fetchMock).toHaveBeenCalledWith('http://api.friendly-e-shop.test/accounts/logout', {
      method: 'POST',
      credentials: 'include',
    });
  });

  it('rejects a failed logout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));

    await expect(postLogout()).rejects.toThrow('Logout request failed with status 503');
  });
});
