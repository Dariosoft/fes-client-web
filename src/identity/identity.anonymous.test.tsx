import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IdentityChrome } from '../identity/IdentityChrome';
import { IdentityProvider } from '../identity/IdentityContext';

vi.mock('../identity/login', () => ({
  startLogin: vi.fn(),
}));

vi.mock('../identity/useIdentitySessionActions', () => ({
  useIdentitySessionActions: () => ({
    applySuccessfulLogin: vi.fn(),
    applySuccessfulLogout: vi.fn(),
  }),
}));

function StoreWithoutGate() {
  return (
    <IdentityProvider initialState={{ status: 'anonymous' }}>
      <IdentityChrome />
      <main>
        <h1>Una tienda simple para empezar a vender.</h1>
        <a href="/catalog">Comprobar catálogo</a>
      </main>
    </IdentityProvider>
  );
}

describe('T15 — store usable without session', () => {
  it('renders store content without requiring login', () => {
    render(<StoreWithoutGate />);

    expect(
      screen.getByRole('heading', {
        name: 'Una tienda simple para empezar a vender.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Comprobar catálogo' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('does not show identity details while anonymous', () => {
    render(<StoreWithoutGate />);

    expect(screen.queryByText('Sesión iniciada')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument();
  });
});
