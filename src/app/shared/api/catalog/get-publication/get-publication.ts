import { getApiBaseUrl } from '../../../config/api-base-url';
import { CATALOG_PATHS } from '../constants';
import type { ProductImage, PublicationDetail } from '../types';

export type GetPublicationInput = {
  id: string;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

function isProductImage(value: unknown): value is ProductImage {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.url);
}

function isStock(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isInteger(value) && value >= 0)
  );
}

function isPublicationDetail(value: unknown): value is PublicationDetail {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    typeof value.name === 'string' &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) &&
    isNonEmptyString(value.currency) &&
    isStock(value.stock) &&
    (value.description === null || typeof value.description === 'string') &&
    isNonEmptyString(value.sellerAccountId) &&
    Array.isArray(value.images) &&
    value.images.every(isProductImage)
  );
}

export async function getPublication(
  input: GetPublicationInput,
): Promise<PublicationDetail | null> {
  const url = `${getApiBaseUrl()}${CATALOG_PATHS.publication}/${encodeURIComponent(input.id)}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    signal: input.signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Publication request failed with status ${String(response.status)}`);
  }

  const payload: unknown = await response.json();

  if (!isPublicationDetail(payload)) {
    throw new Error('Publication response shape is invalid');
  }

  return payload;
}
