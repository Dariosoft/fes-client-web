import { getApiBaseUrl } from '../../../shared/config/api-base-url';

export function buildGoogleLoginUrl(storeOrigin: string): string {
  const returnTo = encodeURIComponent(storeOrigin);
  return `${getApiBaseUrl()}/accounts/login/google?return_to=${returnTo}`;
}
