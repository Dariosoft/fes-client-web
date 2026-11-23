import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { ProductImage } from '../../../shared/api/catalog/types';
import { buildCarouselPosition, STOREFRONT_COPY } from '../constants';

type ProductImageCarouselProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  function showPrevious() {
    setIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext() {
    setIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
      <img
        className="size-full object-cover"
        src={images[index].url}
        alt={hasMultipleImages ? `${productName} — ${String(index + 1)}` : productName}
        loading="lazy"
        decoding="async"
      />

      {hasMultipleImages ? (
        <>
          <button
            type="button"
            aria-label={STOREFRONT_COPY.previousImage}
            onClick={showPrevious}
            className="absolute top-1/2 left-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-card/90 text-foreground transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>

          <button
            type="button"
            aria-label={STOREFRONT_COPY.nextImage}
            onClick={showNext}
            className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-card/90 text-foreground transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>

          <p
            aria-live="polite"
            className="absolute right-1 bottom-1 rounded-full bg-foreground/80 px-2 py-0.5 font-display text-xs font-semibold text-background"
          >
            {buildCarouselPosition(index + 1, images.length)}
          </p>
        </>
      ) : null}
    </div>
  );
}
