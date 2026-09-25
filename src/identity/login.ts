import { accountsUrl } from './accountsClient';

export type StartLoginOptions = {
  /** Absolute URL to return to after the accounts login flow completes. */
  returnUrl?: string;
  /** Optional navigation function; defaults to assigning `window.location`. */
  navigate?: (url: string) => void;
};

/**
 * Starts store login via the accounts service only.
 * Does not validate Google or create accounts in this frontend.
 */
export function startLogin(options: StartLoginOptions = {}): void {
  const returnUrl =
    options.returnUrl ??
    `${window.location.origin}${window.location.pathname}${window.location.search}`;

  const url = new URL(accountsUrl('/login'));
  url.searchParams.set('returnUrl', returnUrl);

  const navigate =
    options.navigate ?? ((target) => {
      window.location.assign(target);
    });

  navigate(url.toString());
}
