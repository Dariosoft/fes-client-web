import { useEffect, useRef, useState } from 'react';

const MIN_VISIBLE_PAGES = 5;
const MAX_VISIBLE_PAGES = 9;
const ELLIPSIS_SLOTS = 2;

type ProductGridPaginationProps = {
  page: number;
  totalPages: number;
  onSelectPage: (page: number) => void;
};

function buildVisiblePages(page: number, totalPages: number, maxVisiblePages: number): number[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_value, index) => index + 1);
  }

  const innerPages = maxVisiblePages - 2;
  const firstInnerPage = Math.min(Math.max(page - Math.floor(innerPages / 2), 2), totalPages - innerPages);

  return [1, ...Array.from({ length: innerPages }, (_value, index) => firstInnerPage + index), totalPages];
}

function largestOdd(value: number): number {
  return value % 2 === 0 ? value - 1 : value;
}

function resolveVisiblePageCount(availableWidth: number, buttonWidth: number, gap: number): number {
  if (availableWidth <= 0 || buttonWidth <= 0) {
    return MIN_VISIBLE_PAGES;
  }

  const capacity = Math.floor((availableWidth + gap) / (buttonWidth + gap));
  const forPages = largestOdd(capacity - ELLIPSIS_SLOTS);

  return Math.min(Math.max(forPages, MIN_VISIBLE_PAGES), MAX_VISIBLE_PAGES);
}

const PAGE_BUTTON_CLASS =
  'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-border bg-card font-display text-sm font-bold text-foreground transition-colors duration-200 ease-out hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-11 motion-reduce:transition-none';

export function ProductGridPagination({ page, totalPages, onSelectPage }: ProductGridPaginationProps) {
  const navRef = useRef<HTMLElement>(null);
  const currentPageRef = useRef<HTMLButtonElement>(null);
  const [maxVisiblePages, setMaxVisiblePages] = useState(MIN_VISIBLE_PAGES);

  useEffect(() => {
    const nav = navRef.current;

    if (nav === null) {
      return;
    }

    function fitToWidth() {
      const list = nav?.querySelector('ul');
      const sampleButton = list?.querySelector('button');
      const gap = Number.parseFloat(list === null || list === undefined ? '0' : getComputedStyle(list).columnGap) || 0;

      setMaxVisiblePages(
        resolveVisiblePageCount(nav?.clientWidth ?? 0, sampleButton?.offsetWidth ?? 0, gap),
      );
    }

    fitToWidth();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(fitToWidth);
    observer.observe(nav);

    return () => {
      observer.disconnect();
    };
  }, [totalPages, maxVisiblePages]);

  useEffect(() => {
    currentPageRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, [page]);

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = buildVisiblePages(page, totalPages, maxVisiblePages);

  return (
    <nav
      ref={navRef}
      aria-label="Paginación del catálogo"
      className="flex max-w-full flex-col items-center gap-2"
    >
      <p className="text-xs font-medium text-muted-foreground sm:text-sm sm:font-semibold">
        Página {page} de {totalPages}
      </p>

      <ul
        aria-label="Páginas"
        className="flex max-w-full flex-nowrap items-center justify-start gap-0.5 overflow-x-auto sm:gap-2"
      >
        {visiblePages.map((visiblePage, index) => {
          const previousPage = visiblePages[index - 1] ?? visiblePage;
          const isCurrent = visiblePage === page;

          return (
            <li key={visiblePage} className="flex shrink-0 items-center gap-0.5 sm:gap-2">
              {visiblePage - previousPage > 1 ? (
                <span aria-hidden="true" className="px-0 text-muted-foreground sm:px-0.5">
                  …
                </span>
              ) : null}
              <button
                ref={isCurrent ? currentPageRef : undefined}
                type="button"
                aria-label={`Página ${String(visiblePage)}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={
                  isCurrent
                    ? 'inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-11'
                    : PAGE_BUTTON_CLASS
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
    </nav>
  );
}
