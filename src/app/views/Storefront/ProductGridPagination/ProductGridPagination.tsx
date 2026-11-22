const MAX_VISIBLE_PAGES = 7;
const INNER_PAGES = MAX_VISIBLE_PAGES - 2;

type ProductGridPaginationProps = {
  page: number;
  totalPages: number;
  onSelectPage: (page: number) => void;
};

function buildVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_value, index) => index + 1);
  }

  const firstInnerPage = Math.min(Math.max(page - Math.floor(INNER_PAGES / 2), 2), totalPages - INNER_PAGES);
  const innerPages = Array.from({ length: INNER_PAGES }, (_value, index) => firstInnerPage + index);

  return [1, ...innerPages, totalPages];
}

export function ProductGridPagination({ page, totalPages, onSelectPage }: ProductGridPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = buildVisiblePages(page, totalPages);

  return (
    <nav aria-label="Paginación del catálogo" className="mt-8 flex flex-col items-center gap-3">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {visiblePages.map((visiblePage, index) => {
          const previousPage = visiblePages[index - 1] ?? visiblePage;
          const isCurrent = visiblePage === page;

          return (
            <li key={visiblePage} className="flex items-center gap-2">
              {visiblePage - previousPage > 1 ? (
                <span aria-hidden="true" className="px-1 text-muted-foreground">
                  …
                </span>
              ) : null}
              <button
                type="button"
                aria-label={`Página ${String(visiblePage)}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={
                  isCurrent
                    ? 'inline-flex size-11 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                    : 'inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border-2 border-border bg-card font-display text-sm font-bold text-foreground transition-colors duration-200 ease-out hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none'
                }
                onClick={() => {
                  if (!isCurrent) {
                    onSelectPage(visiblePage);
                  }
                }}
              >
                {visiblePage}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-sm font-semibold text-muted-foreground">
        Página {page} de {totalPages}
      </p>
    </nav>
  );
}
