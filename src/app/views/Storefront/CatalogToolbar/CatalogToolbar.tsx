import { ProductGridPagination } from '../ProductGridPagination/ProductGridPagination';
import { ProductPageSize } from '../ProductPageSize/ProductPageSize';

type CatalogToolbarProps = {
  size: number;
  onSelectSize: (size: number) => void;
  page?: number;
  totalPages?: number;
  onSelectPage?: (page: number) => void;
};

export function CatalogToolbar({
  size,
  onSelectSize,
  page,
  totalPages,
  onSelectPage,
}: CatalogToolbarProps) {
  const showsPagination =
    page !== undefined && totalPages !== undefined && onSelectPage !== undefined && totalPages > 1;

  return (
    <div className="flex flex-nowrap items-end justify-between gap-3 sm:gap-4">
      <div className="shrink-0">
        <ProductPageSize size={size} onSelectSize={onSelectSize} />
      </div>

      {showsPagination ? (
        <div className="min-w-0 flex-1">
          <ProductGridPagination page={page} totalPages={totalPages} onSelectPage={onSelectPage} />
        </div>
      ) : null}
    </div>
  );
}
