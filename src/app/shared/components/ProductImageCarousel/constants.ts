export const PRODUCT_IMAGE_CAROUSEL_COPY = {
  previousImage: 'Foto anterior',
  nextImage: 'Foto siguiente',
} as const;

export function buildCarouselPosition(current: number, total: number): string {
  return `${String(current)} / ${String(total)}`;
}
