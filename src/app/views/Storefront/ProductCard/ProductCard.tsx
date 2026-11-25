import { ImageOff } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Publication } from '../../../shared/api/catalog/types';
import { ProductImageCarousel } from '../../../shared/components/ProductImageCarousel/ProductImageCarousel';
import type { CatalogLocation } from '../../../shared/lib/catalog-location/catalog-location';
import { formatPrice } from '../../../shared/lib/format-price/format-price';
import { STOREFRONT_COPY } from '../constants';

type ProductCardProps = {
  product: Publication;
  from: CatalogLocation;
};

function activateWithSpace(event: KeyboardEvent<HTMLAnchorElement>) {
  if (event.key !== ' ') {
    return;
  }

  event.preventDefault();
  event.currentTarget.click();
}

const SCROLL_PIXELS_PER_SECOND = 60;

const NAME_FADE_CLASS =
  '[mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)]';

export function ProductCard({ product, from }: ProductCardProps) {
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
      className="relative flex h-full flex-col gap-2 rounded-2xl border-2 border-border bg-card p-2 transition-colors duration-200 ease-out hover:border-primary motion-reduce:transition-none sm:gap-3 sm:p-3"
    >
      <div className="relative">
        {product.images.length > 0 ? (
          <ProductImageCarousel images={product.images} productName={product.name} />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-muted text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-10" />
            <span className="sr-only">{STOREFRONT_COPY.missingImage}</span>
          </div>
        )}
      </div>

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

      <Link
        to={`/publication/${encodeURIComponent(product.id)}`}
        state={{ from }}
        aria-label={`Ver ${product.name}`}
        onKeyDown={activateWithSpace}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
    </article>
  );
}
