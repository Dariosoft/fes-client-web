import { ImageOff } from 'lucide-react';
import { ProductImageCarousel } from '../../../../shared/components/ProductImageCarousel/ProductImageCarousel';
import type { ProductImage } from '../../../../shared/api/catalog/types';
import { PUBLICATION_DETAIL_COPY } from '../../constants';

type PublicationGalleryProps = {
  images: ProductImage[];
  productName: string;
};

function PublicationGalleryEmpty() {
  return (
    <div
      aria-hidden="true"
      className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl bg-muted text-muted-foreground"
    >
      <ImageOff aria-hidden="true" className="size-10" />
      <span className="text-sm font-medium">{PUBLICATION_DETAIL_COPY.missingImage}</span>
    </div>
  );
}

export function PublicationGallery({ images, productName }: PublicationGalleryProps) {
  if (images.length === 0) {
    return <PublicationGalleryEmpty />;
  }

  return <ProductImageCarousel images={images} productName={productName} />;
}
