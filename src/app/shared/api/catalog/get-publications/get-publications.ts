import { getApiBaseUrl } from '../../../config/api-base-url';
import { CATALOG_PATHS, CATALOG_QUERY_PARAMS } from '../constants';
import type { ProductImage, Publication, PublicationsResponse } from '../types';

export type GetPublicationsInput = {
  name: string;
  page: number;
  size: number;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCount(value: unknown, minimum: number): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum;
}

function isProductImage(value: unknown): value is ProductImage {
  return isRecord(value) && typeof value.id === 'string' && typeof value.url === 'string';
}

function isPublication(value: unknown): value is Publication {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) &&
    typeof value.currency === 'string' &&
    value.currency !== '' &&
    (value.stock === null || typeof value.stock === 'number') &&
    Array.isArray(value.images) &&
    value.images.every(isProductImage)
  );
}

function isPublicationsResponse(value: unknown): value is PublicationsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isPublication) &&
    isCount(value.page, 1) &&
    isCount(value.size, 1) &&
    isCount(value.totalItems, 0) &&
    isCount(value.totalPages, 0)
  );
}

export async function getPublications(
  input: GetPublicationsInput,
): Promise<PublicationsResponse> {
  const url = new URL(`${getApiBaseUrl()}${CATALOG_PATHS.publications}`);

  if (input.name !== '') {
    url.searchParams.set(CATALOG_QUERY_PARAMS.name, input.name);
  }

  url.searchParams.set(CATALOG_QUERY_PARAMS.page, String(input.page));
  url.searchParams.set(CATALOG_QUERY_PARAMS.size, String(input.size));

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    signal: input.signal,
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${String(response.status)}`);
  }

  const payload: unknown = await response.json();

  if (!isPublicationsResponse(payload)) {
    throw new Error('Catalog response shape is invalid');
  }

  return payload;
}
