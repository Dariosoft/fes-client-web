import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildGoogleLoginUrl } from './build-google-login-url';

describe('buildGoogleLoginUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds the Google login URL with encoded return_to', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');

    const url = buildGoogleLoginUrl('http://market.friendly-e-shop.test');

    expect(url).toBe(
      'http://api.friendly-e-shop.test/accounts/login/google?return_to=http%3A%2F%2Fmarket.friendly-e-shop.test',
    );
  });
});
