import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PublishedProduct } from '../../../shared/api/catalog/types';
import { ProductCard } from './ProductCard';

function buildProduct(overrides: Partial<PublishedProduct> = {}): PublishedProduct {
  return {
    id: 'product-1',
    name: 'Zapatillas urbanas',
    price: 45999.5,
    currency: 'ARS',
    stock: 7,
    images: [{ id: 'image-1', url: 'https://cdn.friendly-e-shop.test/zapatillas.webp' }],
    ...overrides,
  };
}

describe('ProductCard', () => {
  it('shows the cover image, name, price and currency', () => {
    render(<ProductCard product={buildProduct()} />);

    expect(
      screen.getByRole('img', { name: 'Zapatillas urbanas' }),
    ).toHaveAttribute('src', 'https://cdn.friendly-e-shop.test/zapatillas.webp');
    expect(screen.getByRole('heading', { name: 'Zapatillas urbanas' })).toBeInTheDocument();
    expect(screen.getByText(/\$\s45\.999,50/)).toBeInTheDocument();
  });

  it('formats USD prices with the US dollar symbol', () => {
    render(<ProductCard product={buildProduct({ currency: 'USD', price: 1200 })} />);

    expect(screen.getByText(/US\$\s1\.200,00/)).toBeInTheDocument();
  });

  it('shows the missing image placeholder when the product has no images', () => {
    const { container } = render(<ProductCard product={buildProduct({ images: [] })} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Sin imagen')).toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('is focusable and shows no stock or purchase actions', () => {
    render(<ProductCard product={buildProduct()} />);

    const card = screen.getByRole('article');

    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAccessibleName('Zapatillas urbanas');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/stock|disponibles/i)).not.toBeInTheDocument();
  });
});
