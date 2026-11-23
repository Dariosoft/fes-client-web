import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

function nameText(card: HTMLElement): HTMLElement {
  const span = screen.getByRole('heading', { level: 2 }).querySelector('span');

  if (span === null) {
    throw new Error('Missing name span');
  }

  expect(card.contains(span)).toBe(true);

  return span;
}

function mockClippedName(): void {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 300,
    height: 24,
  } as DOMRect);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(150);
}

describe('ProductCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('scrolls a clipped name while the card is hovered and returns it on leave', () => {
    mockClippedName();
    render(<ProductCard product={buildProduct()} />);

    const card = screen.getByRole('article');
    const span = nameText(card);

    expect(span.style.transform).toBe('translateX(0px)');

    fireEvent.mouseEnter(card);
    expect(span.style.transform).toBe('translateX(-150px)');

    fireEvent.mouseLeave(card);
    expect(span.style.transform).toBe('translateX(0px)');
  });

  it('does not move a name that fits on one line', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 120,
      height: 24,
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(161);
    render(<ProductCard product={buildProduct({ name: 'Mate' })} />);

    const card = screen.getByRole('article');
    const span = nameText(card);

    fireEvent.mouseEnter(card);
    expect(span.style.transform).toBe('translateX(0px)');
  });

  it('is not focusable while it has no action and shows no stock or purchase actions', () => {
    render(<ProductCard product={buildProduct()} />);

    const card = screen.getByRole('article');

    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toHaveAccessibleName('Zapatillas urbanas');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/stock|disponibles/i)).not.toBeInTheDocument();
  });
});
