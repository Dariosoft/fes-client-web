import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CATALOG_PAGE_SIZE,
  CATALOG_SEARCH_PARAMS,
} from '../../shared/config/catalog-search';
import type { PublishedProduct } from '../../shared/api/catalog/types';
import { STOREFRONT_COPY } from './constants';
import { usePublishedProducts } from './hooks/use-published-products/use-published-products';
import type { PublishedProductsState } from './hooks/use-published-products/use-published-products';
import { readCatalogSearch } from './lib/read-catalog-search/read-catalog-search';
import { CatalogToolbar } from './CatalogToolbar/CatalogToolbar';
import { ProductGrid } from './ProductGrid/ProductGrid';
import { ProductGridStatus } from './ProductGridStatus/ProductGridStatus';

type StorefrontContent =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'empty'; searchTerm: string }
  | { kind: 'grid'; products: PublishedProduct[]; totalPages: number };

function createCatalogSearchParams(name: string, page: number, size: number): URLSearchParams {
  const params = new URLSearchParams();

  if (name !== '') {
    params.set(CATALOG_SEARCH_PARAMS.name, name);
  }

  params.set(CATALOG_SEARCH_PARAMS.page, String(page));

  if (size !== CATALOG_PAGE_SIZE) {
    params.set(CATALOG_SEARCH_PARAMS.size, String(size));
  }

  return params;
}

function resolveContent(
  state: PublishedProductsState,
  searchTerm: string,
  shouldShowLoading: boolean,
): StorefrontContent {
  if (shouldShowLoading || state.status === 'loading') {
    return { kind: 'loading' };
  }

  if (state.status === 'error') {
    return { kind: 'error' };
  }

  if (state.data.totalItems === 0) {
    return { kind: 'empty', searchTerm };
  }

  return { kind: 'grid', products: state.data.items, totalPages: state.data.totalPages };
}

export function Storefront() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { name, page, size, shouldCanonicalizeSearch } = readCatalogSearch(searchParams);
  const { state, retry } = usePublishedProducts(name, page, size);
  const totalPages = state.status === 'success' ? state.data.totalPages : 0;
  const isPageOutOfRange =
    state.status === 'success' && (totalPages === 0 ? page > 1 : page > totalPages);
  const shouldShowLoading = shouldCanonicalizeSearch || isPageOutOfRange;
  const content = resolveContent(state, name, shouldShowLoading);

  useEffect(() => {
    if (!shouldShowLoading) {
      return;
    }

    void setSearchParams(createCatalogSearchParams(name, 1, size), { replace: true });
  }, [shouldShowLoading, name, size, setSearchParams]);

  function handleSelectPage(nextPage: number) {
    void setSearchParams(createCatalogSearchParams(name, nextPage, size));
  }

  function handleSelectSize(nextSize: number) {
    void setSearchParams(createCatalogSearchParams(name, 1, nextSize));
  }

  const paginationProps =
    content.kind === 'grid'
      ? { page, totalPages: content.totalPages, onSelectPage: handleSelectPage }
      : {};

  return (
    <section
      aria-label={STOREFRONT_COPY.title}
      className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-14"
    >
      <div className="flex flex-col gap-4">
        <CatalogToolbar size={size} onSelectSize={handleSelectSize} {...paginationProps} />

        {content.kind === 'loading' ? <ProductGridStatus status="loading" /> : null}
        {content.kind === 'error' ? (
          <ProductGridStatus status="error" onRetry={retry} />
        ) : null}
        {content.kind === 'empty' ? (
          <ProductGridStatus status="empty" searchTerm={content.searchTerm} />
        ) : null}
        {content.kind === 'grid' ? <ProductGrid products={content.products} size={size} /> : null}
      </div>
    </section>
  );
}
