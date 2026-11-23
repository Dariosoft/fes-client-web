import { ImageOff } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { Publication } from '../../../shared/api/catalog/types';
import { STOREFRONT_COPY } from '../constants';
import { formatPrice } from '../lib/format-price/format-price';
import { ProductImageCarousel } from '../ProductImageCarousel/ProductImageCarousel';

type ProductCardProps = {
  product: Publication;
};

const SCROLL_PIXELS_PER_SECOND = 60;

const NAME_FADE_CLASS =
  '[mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)]';

export function ProductCard({ product }: ProductCardProps) {
  const titleId = useId();
  const nameRef = useRef<HTMLSpanElement>(null);
  const [nameOffset, setNameOffset] = useState(0);
  const [revealsName, setRevealsName] = useState(false);

  useEffect(() => {
    const text = nameRef.current;
    const container = text?.parentElement;

    if (!text || !container) {
      return;
    }

    const measure = () => {
      const overflow = text.getBoundingClientRect().width - container.clientWidth;
      setNameOffset(overflow > 0.5 ? -overflow : 0);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(text);

    return () => {
      observer.disconnect();
    };
  }, [product.name]);

  const isClipped = nameOffset !== 0;
  const scrollSeconds = Math.max(1, Math.abs(nameOffset) / SCROLL_PIXELS_PER_SECOND);

  return (
    <article
      aria-labelledby={titleId}
      onMouseEnter={() => setRevealsName(true)}
      onMouseLeave={() => setRevealsName(false)}
      className="flex h-full flex-col gap-2 rounded-2xl border-2 border-border bg-card p-2 transition-colors duration-200 ease-out hover:border-primary motion-reduce:transition-none sm:gap-3 sm:p-3"
    >
      {product.images.length > 0 ? (
        <ProductImageCarousel images={product.images} productName={product.name} />
      ) : (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-muted text-muted-foreground">
          <ImageOff aria-hidden="true" className="size-10" />
          <span className="sr-only">{STOREFRONT_COPY.missingImage}</span>
        </div>
      )}

      <h2
        id={titleId}
        className={`overflow-hidden font-display text-sm font-semibold whitespace-nowrap text-foreground sm:text-base ${
          isClipped && !revealsName ? NAME_FADE_CLASS : ''
        }`}
      >
        <span
          ref={nameRef}
          className="inline-block whitespace-nowrap motion-reduce:transition-none"
          style={{
            transform: `translateX(${String(revealsName ? nameOffset : 0)}px)`,
            transitionProperty: 'transform',
            transitionDuration: revealsName ? `${String(scrollSeconds)}s` : '250ms',
            transitionTimingFunction: revealsName ? 'linear' : 'ease-out',
          }}
        >
          {product.name}
        </span>
      </h2>

      <p className="mt-auto font-display text-base font-bold text-foreground sm:text-lg">
        {formatPrice(product.price, product.currency)}
      </p>
    </article>
  );
}
