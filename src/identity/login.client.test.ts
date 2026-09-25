import { describe, expect, it } from 'vitest';
import { accountsUrl } from './accountsClient';
import { startLogin } from './login';

describe('T16 — accounts login client', () => {
  it('startLogin navigates only to /accounts/login, never panel', () => {
    const navigated: string[] = [];

    startLogin({
      returnUrl: 'http://store.test/',
      navigate: (url) => {
        navigated.push(url);
      },
    });

    expect(navigated).toHaveLength(1);
    expect(navigated[0]).toContain('/accounts/login');
    expect(navigated[0]).toContain('returnUrl=');
    expect(navigated[0]).not.toMatch(/panel/i);
    expect(accountsUrl('/login')).toMatch(/\/accounts\/login$/);
    expect(accountsUrl('/me')).toMatch(/\/accounts\/me$/);
  });
});
