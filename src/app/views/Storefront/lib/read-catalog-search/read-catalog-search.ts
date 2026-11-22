import {
  CATALOG_SEARCH_PARAMS,
  normalizeCatalogSearchTerm,
} from '../../../../shared/config/catalog-search';

export type CatalogSearch = {
  name: string;
  page: number;
  shouldCanonicalizePage: boolean;
};

const POSITIVE_INTEGER_PATTERN = /^\d+$/;

function parsePage(raw: string): number | null {
  if (!POSITIVE_INTEGER_PATTERN.test(raw)) {
    return null;
  }

  const page = Number(raw);

  return Number.isSafeInteger(page) && page >= 1 ? page : null;
}

export function readCatalogSearch(params: URLSearchParams): CatalogSearch {
  const name = normalizeCatalogSearchTerm(params.get(CATALOG_SEARCH_PARAMS.name) ?? '');
  const rawPage = params.get(CATALOG_SEARCH_PARAMS.page);

  if (rawPage === null) {
    return { name, page: 1, shouldCanonicalizePage: false };
  }

  const page = parsePage(rawPage);

  if (page === null) {
    return { name, page: 1, shouldCanonicalizePage: true };
  }

  return { name, page, shouldCanonicalizePage: false };
}
