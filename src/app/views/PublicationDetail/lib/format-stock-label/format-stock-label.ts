export function formatStockLabel(stock: number | null): string {
  if (stock === null) {
    return 'Disponible';
  }

  if (stock <= 0) {
    return 'Sin stock';
  }

  return stock === 1 ? '1 disponible' : `${String(stock)} disponibles`;
}
