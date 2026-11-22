import type { PublishedProduct } from '../../../shared/api/catalog/types';
import { ProductCard } from '../ProductCard/ProductCard';

type ProductGridProps = {
  products: PublishedProduct[];
  size: number;
};

export function ProductGrid({ products, size }: ProductGridProps) {
  const pageProducts = products.slice(0, size);

  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6"
    >
      {pageProducts.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
