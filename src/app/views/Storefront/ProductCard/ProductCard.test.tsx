import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Publication } from '../../../shared/api/catalog/types';
import type { CatalogLocation } from '../../../shared/lib/catalog-location/catalog-location';
import { ProductCard } from './ProductCard';

const catalogFrom: CatalogLocation = { name: 'mesa', page: 2, size: 48 };

function buildProduct(overrides: Partial<Publication> = {}): Publication {
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

function LocationProbe() {
  const location = useLocation();

  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

function DestinationProbe() {
  const location = useLocation();
  const params = useParams();

  return (
    <p data-testid="destination">
      {`${location.pathname}|${String(params.id)}|${JSON.stringify(location.state)}`}
    </p>
  );
}

function renderCard(product: Publication = buildProduct()) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ProductCard product={product} from={catalogFrom} />
              <LocationProbe />
            </>
          }
        />
        <Route
          path="/publication/:id"
          element={
            <>
              <h1>Detalle</h1>
              <DestinationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
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
    renderCard();

    expect(
      screen.getByRole('img', { name: 'Zapatillas urbanas' }),
    ).toHaveAttribute('src', 'https://cdn.friendly-e-shop.test/zapatillas.webp');
    expect(screen.getByRole('heading', { name: 'Zapatillas urbanas' })).toBeInTheDocument();
    expect(screen.getByText(/\$\s45\.999,50/)).toBeInTheDocument();
  });

  it('formats USD prices with the US dollar symbol', () => {
    renderCard(buildProduct({ currency: 'USD', price: 1200 }));

    expect(screen.getByText(/US\$\s1\.200,00/)).toBeInTheDocument();
  });

  it('shows the missing image placeholder when the product has no images', () => {
    const { container } = renderCard(buildProduct({ images: [] }));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Sin imagen')).toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('scrolls a clipped name while the card is hovered and returns it on leave', () => {
    mockClippedName();
    renderCard();

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
    renderCard(buildProduct({ name: 'Mate' }));

    const card = screen.getByRole('article');
    const span = nameText(card);

    fireEvent.mouseEnter(card);
    expect(span.style.transform).toBe('translateX(0px)');
  });

  it('renders a focusable link with an accessible name that includes the product', () => {
    renderCard();

    const link = screen.getByRole('link', { name: 'Ver Zapatillas urbanas' });

    expect(link).toHaveAttribute('href', '/publication/product-1');
    link.focus();
    expect(link).toHaveFocus();
  });

  it('opens the publication with the catalog context when clicked', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('link', { name: 'Ver Zapatillas urbanas' }));

    expect(screen.getByTestId('destination')).toHaveTextContent(
      '/publication/product-1|product-1|{"from":{"name":"mesa","page":2,"size":48}}',
    );
  });

  it('opens the publication with Enter', async () => {
    const user = userEvent.setup();
    renderCard();

    screen.getByRole('link', { name: 'Ver Zapatillas urbanas' }).focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('heading', { name: 'Detalle' })).toBeInTheDocument();
  });

  it('opens the publication with Space', async () => {
    const user = userEvent.setup();
    renderCard();

    screen.getByRole('link', { name: 'Ver Zapatillas urbanas' }).focus();
    await user.keyboard(' ');

    expect(screen.getByRole('heading', { name: 'Detalle' })).toBeInTheDocument();
  });

  it('shows no stock or purchase actions', () => {
    renderCard();

    const card = screen.getByRole('article');

    expect(card).toHaveAccessibleName('Zapatillas urbanas');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/stock|disponibles/i)).not.toBeInTheDocument();
  });
});
