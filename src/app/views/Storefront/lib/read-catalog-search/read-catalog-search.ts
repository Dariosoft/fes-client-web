import {
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_PAGE_SIZE,
  CATALOG_SEARCH_PARAMS,
  normalizeCatalogSearchTerm,
} from '../../../../shared/config/catalog-search';

export type CatalogSearch = {
  name: string;
  page: number;
  size: number;
  shouldCanonicalizeSearch: boolean;
};

const POSITIVE_INTEGER_PATTERN = /^\d+$/;

function parsePositiveInteger(raw: string | null, maximum: number | null): number | null {
  if (raw === null || !POSITIVE_INTEGER_PATTERN.test(raw)) {
    return null;
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value) || value < 1) {
    return null;
  }

  return maximum === null || value <= maximum ? value : null;
}

export function readCatalogSearch(params: URLSearchParams): CatalogSearch {
  const name = normalizeCatalogSearchTerm(params.get(CATALOG_SEARCH_PARAMS.name) ?? '');
  const rawPage = params.get(CATALOG_SEARCH_PARAMS.page);
  const rawSize = params.get(CATALOG_SEARCH_PARAMS.size);
  const page = parsePositiveInteger(rawPage, null);
  const size = parsePositiveInteger(rawSize, CATALOG_MAX_PAGE_SIZE);

  return {
    name,
    page: page ?? 1,
    size: size ?? CATALOG_PAGE_SIZE,
    shouldCanonicalizeSearch:
      (rawPage !== null && page === null) || (rawSize !== null && size === null),
  };
}
