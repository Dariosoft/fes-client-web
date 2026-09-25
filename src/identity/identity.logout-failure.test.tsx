import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IdentityChrome } from './IdentityChrome';
import { IdentityProvider, useIdentity } from './IdentityContext';
import { LoginReturnHandler } from './LoginReturnHandler';
import { logoutAndClearSession } from './sessionActions';

vi.mock('./login', () => ({
  startLogin: vi.fn(),
}));

describe('T17 — logout and login failure', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  it('Salir calls accounts logout only and leaves anonymous chrome', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <IdentityProvider
        initialState={{
          status: 'identified',
          displayName: 'Ana Pérez',
          email: 'ana@gmail.com',
        }}
      >
        <IdentityChrome />
        <main>
          <h1>Catálogo</h1>
        </main>
      </IdentityProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Salir' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/accounts\/session\/logout$/),
      expect.objectContaining({ credentials: 'include', method: 'POST' }),
    );
    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).toMatch(/\/accounts\//);
      expect(String(url)).not.toMatch(/panel/i);
    }
  });

  it('logoutAndClearSession returns anonymous without panel calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    const session = await logoutAndClearSession();
    expect(session).toEqual({ status: 'anonymous' });
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/\/accounts\/session\/logout$/);
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toMatch(/panel/i);
  });

  it('login failure keeps anonymous state, shows notice, and allows Entrar again', async () => {
    window.history.replaceState(null, '', '/?login=cancelled');

    function NoticeProbe() {
      const { loginFailedNotice, state } = useIdentity();
      return (
        <p data-testid="probe">
          {state.status}:{loginFailedNotice ?? 'none'}
        </p>
      );
    }

    render(
      <IdentityProvider initialState={{ status: 'anonymous' }}>
        <LoginReturnHandler />
        <IdentityChrome />
        <NoticeProbe />
        <main>
          <h1>Catálogo</h1>
        </main>
      </IdentityProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('probe').textContent).toContain('anonymous');
      expect(screen.getByTestId('probe').textContent).toContain(
        'No se pudo iniciar sesión',
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      'No se pudo iniciar sesión',
    );
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    expect(window.location.search).not.toContain('login=');
  });
});
