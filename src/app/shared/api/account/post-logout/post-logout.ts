import { getApiBaseUrl } from '../../../config/api-base-url';
import { ACCOUNT_PATHS } from '../constants';

export async function postLogout(): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}${ACCOUNT_PATHS.logout}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Logout request failed with status ${String(response.status)}`);
  }
}
