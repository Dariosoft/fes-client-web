import { describe, expect, it } from 'vitest';
import { formatStockLabel } from './format-stock-label';

describe('formatStockLabel', () => {
  it('shows availability for unlimited stock', () => {
    expect(formatStockLabel(null)).toBe('Disponible');
  });

  it('shows the exact quantity for a positive stock', () => {
    expect(formatStockLabel(12)).toBe('12 disponibles');
  });

  it('uses the singular for a single unit', () => {
    expect(formatStockLabel(1)).toBe('1 disponible');
  });

  it('shows no stock defensively for zero or negative values', () => {
    expect(formatStockLabel(0)).toBe('Sin stock');
    expect(formatStockLabel(-3)).toBe('Sin stock');
  });
});
