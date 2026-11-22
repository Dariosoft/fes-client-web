import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Layout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('keeps the storefront header around routed content', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ authenticated: false }));

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<h1>Página routeada</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Friendly E-Shop')).toBeInTheDocument();
    expect(screen.getByRole('search', { name: 'Buscar productos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Página routeada' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Entrar con Google' })).toBeInTheDocument();
  });

  it('keeps the search box available next to the account session', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ authenticated: false }));

    render(
      <MemoryRouter initialEntries={['/?name=mesa&page=2']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<h1>Página routeada</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toHaveValue(
      'mesa',
    );
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Entrar con Google' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://api.friendly-e-shop.test/accounts/session', {
      credentials: 'include',
    });
  });
});
