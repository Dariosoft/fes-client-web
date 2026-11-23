import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatPrice } from './format-price';

function normalizeSpaces(value: string): string {
  return value.replace(/\u00a0/g, ' ');
}

describe('formatPrice', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats ARS prices in es-AR with the peso symbol', () => {
    expect(normalizeSpaces(formatPrice(45999.5, 'ARS'))).toBe('$ 45.999,50');
  });

  it('formats USD prices in es-AR with the US dollar symbol', () => {
    expect(normalizeSpaces(formatPrice(45999.5, 'USD'))).toBe('US$ 45.999,50');
  });

  it('always shows two decimals', () => {
    expect(normalizeSpaces(formatPrice(1000, 'ARS'))).toBe('$ 1.000,00');
  });

  it('falls back to a plain formatted number for invalid currencies', () => {
    expect(formatPrice(45999.5, 'XX')).toBe('XX 45.999,50');
  });

  it('reuses one cached formatter per currency', () => {
    const numberFormatSpy = vi.spyOn(Intl, 'NumberFormat');

    formatPrice(10, 'BRL');
    formatPrice(20, 'BRL');

    expect(numberFormatSpy).toHaveBeenCalledTimes(1);
  });
});
