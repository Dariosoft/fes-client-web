import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Publication } from '../../../shared/api/catalog/types';
import type { CatalogLocation } from '../../../shared/lib/catalog-location/catalog-location';
import { ProductGrid } from './ProductGrid';

const catalogFrom: CatalogLocation = { name: 'silla', page: 3, size: 12 };

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

function LocationProbe() {
  const location = useLocation();

  return (
    <p data-testid="destination">
      {`${location.pathname}${location.search}|${JSON.stringify(location.state)}`}
    </p>
  );
}

function renderGrid(products: Publication[], size = 24) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={<ProductGrid products={products} size={size} from={catalogFrom} />}
        />
        <Route path="/publication/:id" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProductGrid', () => {
  it('renders one semantic list item per product', () => {
    renderGrid(buildProducts(3));

    const list = screen.getByRole('list');

    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).getAllByRole('article')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Producto 2' })).toBeInTheDocument();
  });

  it('renders at most the requested page size', () => {
    renderGrid(buildProducts(30));

    expect(screen.getAllByRole('listitem')).toHaveLength(24);
    expect(screen.getByRole('heading', { name: 'Producto 24' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Producto 25' })).not.toBeInTheDocument();
  });

  it('renders every product when the page size covers them', () => {
    renderGrid(buildProducts(6), 100);

    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it('renders an empty list without crashing', () => {
    renderGrid([]);

    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });

  it('propagates the catalog context to each card link', async () => {
    const user = userEvent.setup();
    renderGrid(buildProducts(2));

    expect(screen.getAllByRole('link', { name: /Ver Producto/ })).toHaveLength(2);

    await user.click(screen.getByRole('link', { name: 'Ver Producto 1' }));

    expect(screen.getByTestId('destination')).toHaveTextContent(
      '/publication/product-1|{"from":{"name":"silla","page":3,"size":12}}',
    );
  });
});
