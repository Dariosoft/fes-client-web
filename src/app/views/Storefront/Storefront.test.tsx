import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Storefront } from './Storefront';

describe('Storefront', () => {
  it('renders the default storefront page without catalog or checkout', () => {
    render(<Storefront />);

    expect(
      screen.getByRole('heading', { name: 'Compra fácil, con una tienda pensada para ti.' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/listado|checkout|carrito|pasarela/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /comprar ahora|iniciar compra/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
