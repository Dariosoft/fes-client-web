export const CATALOG_SEARCH_PARAMS = {
  name: 'name',
  page: 'page',
  size: 'size',
} as const;

export const CATALOG_PAGE_SIZE = 24;

export const CATALOG_MAX_PAGE_SIZE = 100;

export const CATALOG_SEARCH_MAX_LENGTH = 100;

export function normalizeCatalogSearchTerm(raw: string): string {
  return raw.trim().slice(0, CATALOG_SEARCH_MAX_LENGTH);
}
