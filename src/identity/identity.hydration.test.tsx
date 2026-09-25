import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IdentityChrome } from './IdentityChrome';
import { IdentityProvider } from './IdentityContext';
import { IdentityHydrator } from './IdentityHydrator';
import { fetchCurrentSession } from './session';

vi.mock('./login', () => ({
  startLogin: vi.fn(),
}));

vi.mock('./useIdentitySessionActions', () => ({
  useIdentitySessionActions: () => ({
    applySuccessfulLogin: vi.fn(),
    applySuccessfulLogout: vi.fn(),
  }),
}));

describe('T18 — hydration and session sync with accounts', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hydrates as identified when accounts has an active session', async () => {
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

    render(
      <IdentityProvider>
        <IdentityHydrator>
          <IdentityChrome />
        </IdentityHydrator>
      </IdentityProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
      expect(screen.getByText('ana@gmail.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/accounts\/me$/),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('hydrates as anonymous when accounts has no session', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <IdentityProvider>
        <IdentityHydrator>
          <IdentityChrome />
        </IdentityHydrator>
      </IdentityProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    expect(screen.queryByText('Sesión iniciada')).not.toBeInTheDocument();
  });

  it('reflects a session opened in accounts (e.g. panel login) on a new consult', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            displayName: 'Ana Pérez',
            email: 'ana@gmail.com',
          }),
      });
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchCurrentSession()).toEqual({ status: 'anonymous' });
    expect(await fetchCurrentSession()).toEqual({
      status: 'identified',
      displayName: 'Ana Pérez',
      email: 'ana@gmail.com',
    });
  });

  it('reflects a session closed in accounts (e.g. panel logout) on reload hydrate', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <IdentityProvider
        initialState={{
          status: 'identified',
          displayName: 'Stale Local',
          email: 'stale@gmail.com',
        }}
      >
        <IdentityHydrator>
          <IdentityChrome />
        </IdentityHydrator>
      </IdentityProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    expect(screen.queryByText('Stale Local')).not.toBeInTheDocument();
    expect(screen.queryByText('stale@gmail.com')).not.toBeInTheDocument();
  });
});
