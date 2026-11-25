import type { Publication } from '../../../shared/api/catalog/types';
import type { CatalogLocation } from '../../../shared/lib/catalog-location/catalog-location';
import { ProductCard } from '../ProductCard/ProductCard';

type ProductGridProps = {
  products: Publication[];
  size: number;
  from: CatalogLocation;
};

export function ProductGrid({ products, size, from }: ProductGridProps) {
  const pageProducts = products.slice(0, size);

  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6"
    >
      {pageProducts.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} from={from} />
        </li>
      ))}
    </ul>
  );
}
