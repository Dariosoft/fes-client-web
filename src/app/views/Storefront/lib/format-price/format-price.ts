const CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>();

const PLAIN_NUMBER_FORMATTER = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function createCurrencyFormatter(currency: string): Intl.NumberFormat | null {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
    if (error instanceof RangeError) {
      return null;
    }

    throw error;
  }
}

function getCurrencyFormatter(currency: string): Intl.NumberFormat | null {
  const cached = CURRENCY_FORMATTERS.get(currency);

  if (cached !== undefined) {
    return cached;
  }

  const formatter = createCurrencyFormatter(currency);

  if (formatter !== null) {
    CURRENCY_FORMATTERS.set(currency, formatter);
  }

  return formatter;
}

export function formatPrice(price: number, currency: string): string {
  const formatter = getCurrencyFormatter(currency);

  if (formatter !== null) {
    return formatter.format(price);
  }

  return `${currency} ${PLAIN_NUMBER_FORMATTER.format(price)}`;
}
