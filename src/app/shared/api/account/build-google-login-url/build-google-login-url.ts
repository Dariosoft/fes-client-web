import { getApiBaseUrl } from '../../../config/api-base-url';
import { ACCOUNT_PARAMS, ACCOUNT_PATHS } from '../constants';

export function buildGoogleLoginUrl(storeOrigin: string): string {
  const returnTo = encodeURIComponent(storeOrigin);
  return `${getApiBaseUrl()}${ACCOUNT_PATHS.googleLogin}?${ACCOUNT_PARAMS.returnTo}=${returnTo}`;
}
