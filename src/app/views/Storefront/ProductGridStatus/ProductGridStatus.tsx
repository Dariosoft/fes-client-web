import { CATALOG_PAGE_SIZE } from '../../../shared/config/catalog-search';
import { buildEmptySearchMessage, STOREFRONT_COPY } from '../constants';

type ProductGridStatusProps =
  | { status: 'loading' }
  | { status: 'empty'; searchTerm: string }
  | { status: 'error'; onRetry: () => void };

const SKELETON_KEYS = Array.from({ length: CATALOG_PAGE_SIZE }, (_value, index) => index);

function ProductGridLoading() {
  return (
    <div role="status" aria-live="polite" className="w-full">
      <span className="sr-only">{STOREFRONT_COPY.loading}</span>
      <ul
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {SKELETON_KEYS.map((skeletonKey) => (
          <li
            key={skeletonKey}
            className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-card p-3"
          >
            <div className="aspect-square w-full rounded-xl bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-6 w-1/2 rounded bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductGridEmpty({ searchTerm }: { searchTerm: string }) {
  const isSearchEmpty = searchTerm !== '';

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold text-foreground">
        {isSearchEmpty ? buildEmptySearchMessage(searchTerm) : STOREFRONT_COPY.emptyCatalog}
      </p>
      <p className="mt-2 text-base text-muted-foreground">
        {isSearchEmpty ? STOREFRONT_COPY.emptySearchHint : STOREFRONT_COPY.emptyCatalogHint}
      </p>
    </div>
  );
}

function ProductGridError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-destructive bg-card px-6 py-12 text-center"
    >
      <p className="font-display text-lg font-semibold text-foreground">{STOREFRONT_COPY.error}</p>
      <button
        type="button"
        className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 font-bold text-on-primary transition-colors duration-200 ease-out hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        onClick={onRetry}
      >
        {STOREFRONT_COPY.retry}
      </button>
    </div>
  );
}

export function ProductGridStatus(props: ProductGridStatusProps) {
  if (props.status === 'error') {
    return <ProductGridError onRetry={props.onRetry} />;
  }

  if (props.status === 'empty') {
    return <ProductGridEmpty searchTerm={props.searchTerm} />;
  }

  return <ProductGridLoading />;
}
