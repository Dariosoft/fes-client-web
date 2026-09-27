import { getApiBaseUrl } from '../../../shared/config/api-base-url';

export async function postLogout(): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/accounts/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Logout request failed with status ${String(response.status)}`);
  }
}
