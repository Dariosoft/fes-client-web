import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from '../Layout/Layout';
import { Storefront } from '../Storefront/Storefront';
import { PublicationDetail } from './PublicationDetail';

const publicationDetail = {
  id: 'product-1',
  name: 'Mesa ratona',
  price: 45999.5,
  currency: 'ARS',
  stock: 2,
  description: 'Madera maciza con terminación natural.',
  sellerAccountId: 'seller-1',
  images: [{ id: 'image-1', url: 'https://cdn.fes.test/mesa.webp' }],
};

const publicationSummary = {
  id: 'product-1',
  name: 'Mesa ratona',
  price: 45999.5,
  currency: 'ARS',
  stock: 2,
  images: [{ id: 'image-1', url: 'https://cdn.fes.test/mesa.webp' }],
};

function toUrl(input: Parameters<typeof fetch>[0]): URL {
  if (input instanceof URL) {
    return input;
  }

  return new URL(typeof input === 'string' ? input : input.url);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function respond(url: URL): Response {
  if (url.pathname === '/accounts/session') {
    return jsonResponse({ authenticated: false });
  }

  if (url.pathname === '/catalog/publication/product-1') {
    return jsonResponse(publicationDetail);
  }

  if (url.pathname === '/catalog/publication') {
    const page = Number(url.searchParams.get('page') ?? '1');
    const size = Number(url.searchParams.get('size') ?? '24');

    return jsonResponse({
      items: [publicationSummary],
      page,
      size,
      totalItems: 145,
      totalPages: 3,
    });
  }

  if (url.pathname === '/accounts/shops/seller-1') {
    return jsonResponse({ name: 'Bazar del Sur', description: null });
  }

  return jsonResponse({}, 404);
}

function LocationProbe() {
  const location = useLocation();

  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

function renderApp(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Storefront />} />
          <Route path="publication/:id" element={<PublicationDetail />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function currentLocation(): string {
  return screen.getByTestId('location').textContent ?? '';
}

describe('PublicationDetail integration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) =>
      Promise.resolve(respond(toUrl(input))),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('opens the detail from a card and returns to the catalog with the search context', async () => {
    const user = userEvent.setup();
    renderApp('/?name=mesa&page=2&size=48');

    await user.click(await screen.findByRole('link', { name: 'Ver Mesa ratona' }));

    await waitFor(() => expect(currentLocation()).toBe('/publication/product-1'));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mesa ratona' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Friendly E-Shop')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Tienda' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Volver al catálogo' }));

    await waitFor(() => expect(currentLocation()).toBe('/?name=mesa&page=2&size=48'));
    expect(await screen.findByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('opens a direct detail URL without a session and returns to the default catalog', async () => {
    const user = userEvent.setup();
    renderApp('/publication/product-1');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mesa ratona' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Friendly E-Shop')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Entrar con Google' })).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: 'Volver al catálogo' });

    expect(backLink).toHaveAttribute('href', '/');
    await user.click(backLink);

    await waitFor(() => expect(currentLocation()).toBe('/'));
  });
});
