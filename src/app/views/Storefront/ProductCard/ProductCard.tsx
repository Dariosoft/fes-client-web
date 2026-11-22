import { ImageOff } from 'lucide-react';
import { useId } from 'react';
import type { PublishedProduct } from '../../../shared/api/catalog/types';
import { STOREFRONT_COPY } from '../constants';
import { formatPrice } from '../lib/format-price/format-price';

type ProductCardProps = {
  product: PublishedProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const titleId = useId();
  const coverImage = product.images[0];

  return (
    <article
      tabIndex={0}
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-3 rounded-2xl border-2 border-border bg-card p-3 transition-colors duration-200 ease-out hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {coverImage ? (
          <img
            className="size-full object-cover"
            src={coverImage.url}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-10" />
            <span className="sr-only">{STOREFRONT_COPY.missingImage}</span>
          </div>
        )}
      </div>

      <h2 id={titleId} className="font-display text-base font-semibold text-foreground">
        {product.name}
      </h2>

      <p className="mt-auto font-display text-lg font-bold text-foreground">
        {formatPrice(product.price, product.currency)}
      </p>
    </article>
  );
}
