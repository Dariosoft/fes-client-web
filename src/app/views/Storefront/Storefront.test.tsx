import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import type { PublishedProduct, PublishedProductsResponse } from '../../shared/api/catalog/types';
import { Layout } from '../Layout/Layout';
import { Storefront } from './Storefront';

function buildProducts(count: number): PublishedProduct[] {
  return Array.from({ length: count }, (_value, index) => ({
    id: `product-${String(index + 1)}`,
    name: `Producto ${String(index + 1)}`,
    price: 1000 + index,
    currency: 'ARS',
    stock: 3,
    images: [],
  }));
}

function catalogResponse(overrides: Partial<PublishedProductsResponse> = {}) {
  return {
    items: buildProducts(24),
    page: 1,
    size: 24,
    totalItems: 48,
    totalPages: 2,
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function toUrl(input: Parameters<typeof fetch>[0]): URL {
  if (input instanceof URL) {
    return input;
  }

  return new URL(typeof input === 'string' ? input : input.url);
}

function mockCatalogFetch(handler: (url: URL) => Response): URL[] {
  const requestedUrls: URL[] = [];

  vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = toUrl(input);
    requestedUrls.push(url);

    return Promise.resolve(handler(url));
  });

  return requestedUrls;
}

function LocationProbe() {
  const location = useLocation();

  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

function renderStorefront(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Storefront />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

function currentLocation(): string {
  return screen.getByTestId('location').textContent ?? '';
}

function HistoryProbe() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <p data-testid="location">{`${location.pathname}${location.search}`}</p>
      <button
        type="button"
        onClick={() => {
          void navigate(-1);
        }}
      >
        Atrás
      </button>
    </>
  );
}

function renderStorefrontApp(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <HistoryProbe />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Storefront />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function mockStorefrontFetch(handler: (url: URL) => Response): URL[] {
  const requestedUrls: URL[] = [];

  vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = toUrl(input);

    if (url.pathname.endsWith('/accounts/session')) {
      return Promise.resolve(jsonResponse({ authenticated: false }));
    }

    requestedUrls.push(url);

    return Promise.resolve(handler(url));
  });

  return requestedUrls;
}

describe('Storefront', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('shows the loading skeletons before the catalog answers', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => undefined));

    renderStorefront();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…');
  });

  it('renders the published products of the first page', async () => {
    const requestedUrls = mockCatalogFetch(() => jsonResponse(catalogResponse()));

    renderStorefront();

    expect(await screen.findByRole('heading', { name: 'Producto 1' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(24);
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(requestedUrls[0]?.search).toBe('?page=1&size=24');
  });

  it('queries the name and page from the URL', async () => {
    const requestedUrls = mockCatalogFetch(() =>
      jsonResponse(catalogResponse({ page: 2, totalItems: 30, totalPages: 2 })),
    );

    renderStorefront('/?name=mesa&page=2');

    expect(await screen.findByRole('heading', { name: 'Producto 1' })).toBeInTheDocument();

    const requestedUrl = requestedUrls[0];

    expect(requestedUrl?.searchParams.get('name')).toBe('mesa');
    expect(requestedUrl?.searchParams.get('page')).toBe('2');
    expect(requestedUrl?.searchParams.get('size')).toBe('24');
  });

  it('honours the page size from the URL and keeps it when changing page', async () => {
    const user = userEvent.setup();
    const requestedUrls = mockCatalogFetch((url) => {
      const page = Number(url.searchParams.get('page'));

      return jsonResponse(
        catalogResponse({ page, size: 4, items: buildProducts(4), totalItems: 8, totalPages: 2 }),
      );
    });

    renderStorefront('/?size=4');
    await screen.findByRole('heading', { name: 'Producto 1' });

    expect(requestedUrls[0]?.searchParams.get('size')).toBe('4');
    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(currentLocation()).toBe('/?size=4');

    await user.click(screen.getByRole('button', { name: 'Página 2' }));

    await waitFor(() => expect(currentLocation()).toBe('/?page=2&size=4'));
    await waitFor(() => expect(requestedUrls.at(-1)?.searchParams.get('size')).toBe('4'));
  });

  it('drops an invalid page size and falls back to the default', async () => {
    const requestedUrls = mockCatalogFetch(() => jsonResponse(catalogResponse()));

    renderStorefront('/?size=500');
    await screen.findByRole('heading', { name: 'Producto 1' });

    expect(requestedUrls[0]?.searchParams.get('size')).toBe('24');
    await waitFor(() => expect(currentLocation()).toBe('/?page=1'));
  });

  it('keeps the active term when the visitor changes page', async () => {
    const user = userEvent.setup();
    const requestedUrls = mockCatalogFetch((url) => {
      const page = Number(url.searchParams.get('page'));

      return jsonResponse(
        catalogResponse({ page, items: buildProducts(24), totalItems: 48, totalPages: 2 }),
      );
    });

    renderStorefront('/?name=mesa&page=1');
    await screen.findByRole('heading', { name: 'Producto 1' });

    await user.click(screen.getByRole('button', { name: 'Página 2' }));

    await waitFor(() => expect(currentLocation()).toBe('/?name=mesa&page=2'));
    await waitFor(() => expect(requestedUrls.at(-1)?.searchParams.get('page')).toBe('2'));
    expect(requestedUrls.at(-1)?.searchParams.get('name')).toBe('mesa');
  });

  it('keeps the grid list semantic', async () => {
    mockCatalogFetch(() => jsonResponse(catalogResponse()));

    renderStorefront();

    await screen.findByRole('heading', { name: 'Producto 1' });

    const productList = screen
      .getAllByRole('list')
      .find((list) => within(list).queryAllByRole('article').length > 0);

    expect(productList).toBeDefined();
    expect(within(productList as HTMLElement).getAllByRole('article')).toHaveLength(24);
  });

  it.each(['abc', '0', '-2', '1.5', '1e999'])(
    'canonicalizes the invalid page %j to page 1',
    async (rawPage) => {
      const requestedUrls = mockCatalogFetch(() => jsonResponse(catalogResponse()));

      renderStorefront(`/?name=mesa&page=${rawPage}`);

      await waitFor(() => expect(currentLocation()).toBe('/?name=mesa&page=1'));
      expect(await screen.findByRole('heading', { name: 'Producto 1' })).toBeInTheDocument();
      expect(requestedUrls.every((url) => url.searchParams.get('page') === '1')).toBe(true);
    },
  );

  it('corrects a page beyond the total pages to page 1 without showing the adjusted page', async () => {
    const requestedUrls = mockCatalogFetch((url) => {
      if (url.searchParams.get('page') === '1') {
        return jsonResponse(catalogResponse());
      }

      return jsonResponse(
        catalogResponse({
          page: 2,
          items: buildProducts(1).map((product) => ({
            ...product,
            name: 'Ajustado por la API',
          })),
        }),
      );
    });

    renderStorefront('/?page=9');

    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…');
    await waitFor(() => expect(currentLocation()).toBe('/?page=1'));
    expect(await screen.findByRole('heading', { name: 'Producto 1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ajustado por la API' })).not.toBeInTheDocument();
    expect(requestedUrls.at(-1)?.searchParams.get('page')).toBe('1');
  });

  it('corrects page 2 to page 1 when the catalog has no published products', async () => {
    mockCatalogFetch(() =>
      jsonResponse({ items: [], page: 1, size: 24, totalItems: 0, totalPages: 0 }),
    );

    renderStorefront('/?page=2');

    await waitFor(() => expect(currentLocation()).toBe('/?page=1'));
    expect(await screen.findByText('Todavía no hay productos publicados.')).toBeInTheDocument();
  });

  it('shows the empty search state for a term without matches', async () => {
    mockCatalogFetch(() =>
      jsonResponse({ items: [], page: 1, size: 24, totalItems: 0, totalPages: 0 }),
    );

    renderStorefront('/?name=inexistente&page=1');

    expect(
      await screen.findByText('No encontramos productos para “inexistente”.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Probá con otro nombre o revisá la ortografía.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows the empty catalog state without a search term', async () => {
    mockStorefrontFetch(() =>
      jsonResponse({ items: [], page: 1, size: 24, totalItems: 0, totalPages: 0 }),
    );

    renderStorefrontApp('/');

    expect(await screen.findByText('Todavía no hay productos publicados.')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toBeInTheDocument();
  });

  it('shows the error state, keeps the search box and retries', async () => {
    const user = userEvent.setup();
    let shouldFail = true;
    const requestedUrls = mockStorefrontFetch(() =>
      shouldFail ? jsonResponse({}, 500) : jsonResponse(catalogResponse()),
    );

    renderStorefrontApp('/?name=mesa&page=1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos cargar los productos. Revisá tu conexión e intentá de nuevo.',
    );
    expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toHaveValue(
      'mesa',
    );

    shouldFail = false;
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { name: 'Producto 1' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(requestedUrls).toHaveLength(2);
    expect(requestedUrls.at(-1)?.searchParams.get('name')).toBe('mesa');
  });

  it('renders the empty search state after a search with no matches', async () => {
    const user = userEvent.setup();
    mockStorefrontFetch((url) =>
      url.searchParams.get('name') === 'inexistente'
        ? jsonResponse({ items: [], page: 1, size: 24, totalItems: 0, totalPages: 0 })
        : jsonResponse(catalogResponse()),
    );

    renderStorefrontApp('/');
    await screen.findByRole('heading', { name: 'Producto 1' });

    const searchbox = screen.getByRole('searchbox', { name: 'Buscar productos por nombre' });

    await user.type(searchbox, 'inexistente{Enter}');

    expect(
      await screen.findByText('No encontramos productos para “inexistente”.'),
    ).toBeInTheDocument();
    expect(currentLocation()).toBe('/?page=1&name=inexistente');
  });

  describe('search and URL integration', () => {
    it('applies a new search on page 1 and reflects it in the URL', async () => {
      const user = userEvent.setup();
      const requestedUrls = mockStorefrontFetch(() => jsonResponse(catalogResponse()));

      renderStorefrontApp('/?name=viejo&page=2');
      await screen.findByRole('heading', { name: 'Producto 1' });

      const searchbox = screen.getByRole('searchbox', { name: 'Buscar productos por nombre' });

      expect(searchbox).toHaveValue('viejo');

      await user.clear(searchbox);
      await user.type(searchbox, 'mesa{Enter}');

      await waitFor(() => expect(currentLocation()).toBe('/?page=1&name=mesa'));
      expect(requestedUrls.at(-1)?.searchParams.get('name')).toBe('mesa');
      expect(requestedUrls.at(-1)?.searchParams.get('page')).toBe('1');
    });

    it('reproduces the term and page when the URL is opened directly', async () => {
      const requestedUrls = mockStorefrontFetch((url) =>
        jsonResponse(catalogResponse({ page: Number(url.searchParams.get('page')) })),
      );

      renderStorefrontApp('/?name=silla&page=2');

      expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument();
      expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toHaveValue(
        'silla',
      );
      expect(requestedUrls[0]?.searchParams.get('name')).toBe('silla');
      expect(requestedUrls[0]?.searchParams.get('page')).toBe('2');
    });

    it('restores the previous search when the visitor goes back', async () => {
      const user = userEvent.setup();
      mockStorefrontFetch((url) =>
        jsonResponse(catalogResponse({ page: Number(url.searchParams.get('page')) })),
      );

      renderStorefrontApp('/?name=viejo&page=2');
      await screen.findByText('Página 2 de 2');

      const searchbox = screen.getByRole('searchbox', { name: 'Buscar productos por nombre' });

      await user.clear(searchbox);
      await user.type(searchbox, 'nuevo{Enter}');
      await waitFor(() => expect(currentLocation()).toBe('/?page=1&name=nuevo'));

      await user.click(screen.getByRole('button', { name: 'Atrás' }));

      await waitFor(() => expect(currentLocation()).toBe('/?name=viejo&page=2'));
      expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toHaveValue(
        'viejo',
      );
    });
  });
});
