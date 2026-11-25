import {
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_PAGE_SIZE,
  CATALOG_SEARCH_PARAMS,
  normalizeCatalogSearchTerm,
} from '../../config/catalog-search';

export type CatalogLocation = {
  name: string;
  page: number;
  size: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSafePage(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

function isSafeSize(value: unknown): value is number {
  return isSafePage(value) && value <= CATALOG_MAX_PAGE_SIZE;
}

function isDefaultCatalogLocation(location: CatalogLocation): boolean {
  return location.name === '' && location.page === 1 && location.size === CATALOG_PAGE_SIZE;
}

export function buildCatalogSearchParams(location: CatalogLocation): URLSearchParams {
  const params = new URLSearchParams();

  if (location.name !== '') {
    params.set(CATALOG_SEARCH_PARAMS.name, location.name);
  }

  params.set(CATALOG_SEARCH_PARAMS.page, String(location.page));

  if (location.size !== CATALOG_PAGE_SIZE) {
    params.set(CATALOG_SEARCH_PARAMS.size, String(location.size));
  }

  return params;
}

export function buildCatalogHref(location: CatalogLocation): string {
  if (isDefaultCatalogLocation(location)) {
    return '/';
  }

  return `/?${buildCatalogSearchParams(location).toString()}`;
}

export function readCatalogReturnState(state: unknown): CatalogLocation | null {
  if (!isRecord(state) || !isRecord(state.from)) {
    return null;
  }

  const { name, page, size } = state.from;

  if (typeof name !== 'string' || !isSafePage(page) || !isSafeSize(size)) {
    return null;
  }

  return { name: normalizeCatalogSearchTerm(name), page, size };
}
