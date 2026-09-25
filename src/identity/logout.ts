import { accountsFetchInit, accountsUrl } from './accountsClient';

/**
 * Ends the shared session via the accounts service only.
 * Does not call the panel service.
 */
export async function logout(): Promise<void> {
  await fetch(accountsUrl('/session/logout'), {
    ...accountsFetchInit,
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
}
