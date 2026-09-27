import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionChrome } from '../components/SessionChrome';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('account session chrome', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('shows Entrar and not Salir for an anonymous session', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ authenticated: false }));

    render(<SessionChrome />);

    expect(await screen.findByRole('button', { name: 'Entrar con Google' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument();
  });

  it('shows name and Salir when authenticated', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        authenticated: true,
        id: 'acc-1',
        email: 'ana@example.com',
        name: 'Ana',
      }),
    );

    render(<SessionChrome />);

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Entrar con Google' })).not.toBeInTheDocument();
    expect(screen.queryByText('ana@example.com')).not.toBeInTheDocument();
  });

  it('keeps the page usable and shows Entrar plus a notice when session is unreachable', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    render(<SessionChrome />);

    expect(await screen.findByRole('button', { name: 'Entrar con Google' })).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo comprobar la sesión.');
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument();
  });

  it('requests session with credentials against the shared API base', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ authenticated: false }));

    render(<SessionChrome />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://api.friendly-e-shop.test/accounts/session', {
        credentials: 'include',
      });
    });
  });
});
