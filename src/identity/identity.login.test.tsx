import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IdentityChrome } from './IdentityChrome';
import { IdentityProvider } from './IdentityContext';
import { fetchCurrentSession } from './session';
import { refreshSessionAfterLogin } from './sessionActions';

const startLoginMock = vi.hoisted(() => vi.fn());

vi.mock('./login', () => ({
  startLogin: (...args: unknown[]): void => {
    startLoginMock(...args);
  },
}));

vi.mock('./useIdentitySessionActions', () => ({
  useIdentitySessionActions: () => ({
    applySuccessfulLogin: vi.fn(),
    applySuccessfulLogout: vi.fn(),
  }),
}));

describe('T16 — Entrar via accounts only', () => {
  beforeEach(() => {
    startLoginMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('Entrar button starts the accounts login flow', async () => {
    const user = userEvent.setup();

    render(
      <IdentityProvider initialState={{ status: 'anonymous' }}>
        <IdentityChrome />
        <main>
          <h1>Catálogo</h1>
        </main>
      </IdentityProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(startLoginMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
  });

  it('successful session response becomes identified with name and email', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          displayName: 'Ana Pérez',
          email: 'ana@gmail.com',
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const session = await refreshSessionAfterLogin();

    expect(session).toEqual({
      status: 'identified',
      displayName: 'Ana Pérez',
      email: 'ana@gmail.com',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/accounts\/me$/),
      expect.objectContaining({ credentials: 'include', method: 'GET' }),
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toMatch(/panel/i);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('does not create or persist an account locally after identifying', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          displayName: 'Ana Pérez',
          email: 'ana@gmail.com',
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const session = await fetchCurrentSession();
    expect(session.status).toBe('identified');

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

    await waitFor(() => {
      expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
      expect(screen.getByText('ana@gmail.com')).toBeInTheDocument();
    });

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).toMatch(/\/accounts\//);
      expect(String(url)).not.toMatch(/panel/i);
    }
  });
});
