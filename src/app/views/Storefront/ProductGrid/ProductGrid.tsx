import type { PublishedProduct } from '../../../shared/api/catalog/types';
import { CATALOG_PAGE_SIZE } from '../../../shared/config/catalog-search';
import { ProductCard } from '../ProductCard/ProductCard';

type ProductGridProps = {
  products: PublishedProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  const pageProducts = products.slice(0, CATALOG_PAGE_SIZE);

  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {pageProducts.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
