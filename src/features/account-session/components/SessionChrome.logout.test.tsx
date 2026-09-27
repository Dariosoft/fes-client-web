import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionChrome } from './SessionChrome';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('session chrome login error and logout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    window.history.replaceState(null, '', '/');
  });

  it('shows login-failed notice when return URL has login_error and session is anonymous', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    window.history.replaceState(null, '', '/?login_error=1');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ authenticated: false }));

    render(<SessionChrome />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo entrar.');
    expect(screen.getByRole('button', { name: 'Entrar con Google' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('login_error');
  });

  it('returns to anonymous UI after a successful logout', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        jsonResponse({
          authenticated: true,
          id: 'acc-1',
          email: 'ana@example.com',
          name: 'Ana',
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const user = userEvent.setup();
    render(<SessionChrome />);

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Salir' }));

    expect(await screen.findByRole('button', { name: 'Entrar con Google' })).toBeInTheDocument();
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://api.friendly-e-shop.test/accounts/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });
  });
});
