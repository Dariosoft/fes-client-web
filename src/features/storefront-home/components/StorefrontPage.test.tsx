import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StorefrontPage } from './StorefrontPage';

describe('StorefrontPage', () => {
  it('renders the storefront shell without catalog or checkout', () => {
    render(<StorefrontPage />);

    expect(screen.getByText('Friendly E-Shop')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Compra fácil, con una tienda pensada para ti.' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/listado|checkout|carrito|pasarela/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /comprar ahora|iniciar compra/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
