import { getApiBaseUrl } from '../../../config/api-base-url';
import { ACCOUNT_PATHS } from '../constants';
import type { PublicShop } from '../types';

export type GetPublicShopInput = {
  sellerAccountId: string;
  signal?: AbortSignal;
};

function isPublicShop(value: unknown): value is PublicShop {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.name === 'string' &&
    record.name !== '' &&
    (record.description === null || typeof record.description === 'string')
  );
}

export async function getPublicShop(input: GetPublicShopInput): Promise<PublicShop | null> {
  const url = `${getApiBaseUrl()}${ACCOUNT_PATHS.publicShop}/${encodeURIComponent(
    input.sellerAccountId,
  )}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    signal: input.signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Shop request failed with status ${String(response.status)}`);
  }

  const payload: unknown = await response.json();

  if (!isPublicShop(payload)) {
    throw new Error('Shop response shape is invalid');
  }

  return payload;
}
