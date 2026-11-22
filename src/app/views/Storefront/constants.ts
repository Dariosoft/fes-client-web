export const STOREFRONT_COPY = {
  title: 'Productos',
  missingImage: 'Sin imagen',
  loading: 'Cargando productos…',
  emptyCatalog: 'Todavía no hay productos publicados.',
  emptyCatalogHint: 'Volvé pronto: la tienda está preparando su surtido.',
  emptySearchHint: 'Probá con otro nombre o revisá la ortografía.',
  error: 'No pudimos cargar los productos. Revisá tu conexión e intentá de nuevo.',
  retry: 'Reintentar',
  previousImage: 'Foto anterior',
  nextImage: 'Foto siguiente',
} as const;

export function buildCarouselPosition(current: number, total: number): string {
  return `${String(current)} / ${String(total)}`;
}

export function buildEmptySearchMessage(searchTerm: string): string {
  return `No encontramos productos para “${searchTerm}”.`;
}
