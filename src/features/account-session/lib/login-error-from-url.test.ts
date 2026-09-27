import { describe, expect, it, vi } from 'vitest';
import { consumeLoginErrorFromUrl } from './login-error-from-url';

describe('consumeLoginErrorFromUrl', () => {
  it('detects login_error=1 and clears it from the URL', () => {
    const replaceState = vi.fn();

    const hadError = consumeLoginErrorFromUrl(
      '?login_error=1&utm=store',
      { replaceState },
      'http://market.friendly-e-shop.test/?login_error=1&utm=store',
    );

    expect(hadError).toBe(true);
    expect(replaceState).toHaveBeenCalledWith(null, '', '/?utm=store');
  });

  it('does not alter history when the indicator is absent', () => {
    const replaceState = vi.fn();

    const hadError = consumeLoginErrorFromUrl(
      '?utm=store',
      { replaceState },
      'http://market.friendly-e-shop.test/?utm=store',
    );

    expect(hadError).toBe(false);
    expect(replaceState).not.toHaveBeenCalled();
  });
});
