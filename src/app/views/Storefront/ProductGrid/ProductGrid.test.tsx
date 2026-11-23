import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Publication } from '../../../shared/api/catalog/types';
import { ProductGrid } from './ProductGrid';

function buildProducts(count: number): Publication[] {
  return Array.from({ length: count }, (_value, index) => ({
    id: `product-${String(index + 1)}`,
    name: `Producto ${String(index + 1)}`,
    price: 1000 + index,
    currency: 'ARS',
    stock: 2,
    images: [],
  }));
}

describe('ProductGrid', () => {
  it('renders one semantic list item per product', () => {
    render(<ProductGrid products={buildProducts(3)} size={24} />);

    const list = screen.getByRole('list');

    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).getAllByRole('article')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Producto 2' })).toBeInTheDocument();
  });

  it('renders at most the requested page size', () => {
    render(<ProductGrid products={buildProducts(30)} size={24} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(24);
    expect(screen.getByRole('heading', { name: 'Producto 24' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Producto 25' })).not.toBeInTheDocument();
  });

  it('renders every product when the page size covers them', () => {
    render(<ProductGrid products={buildProducts(6)} size={100} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it('renders an empty list without crashing', () => {
    render(<ProductGrid products={[]} size={24} />);

    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });
});
