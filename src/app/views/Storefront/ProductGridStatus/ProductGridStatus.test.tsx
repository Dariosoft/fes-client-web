import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductGridStatus } from './ProductGridStatus';

describe('ProductGridStatus', () => {
  it('announces the loading state and reserves 24 cards of space', () => {
    const { container } = render(<ProductGridStatus status="loading" />);

    const status = screen.getByRole('status');

    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Cargando productos…')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(24);
    expect(status.querySelector('ul')).toHaveAttribute('aria-hidden', 'true');
  });

  it('explains that the active search has no matches', () => {
    render(<ProductGridStatus status="empty" searchTerm="zapatilla" />);

    expect(
      screen.getByText('No encontramos productos para “zapatilla”.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Probá con otro nombre o revisá la ortografía.')).toBeInTheDocument();
    expect(screen.queryByText('Todavía no hay productos publicados.')).not.toBeInTheDocument();
  });

  it('explains that the catalog has no published products yet', () => {
    render(<ProductGridStatus status="empty" searchTerm="" />);

    expect(screen.getByText('Todavía no hay productos publicados.')).toBeInTheDocument();
    expect(
      screen.getByText('Volvé pronto: la tienda está preparando su surtido.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No encontramos productos/)).not.toBeInTheDocument();
  });

  it('announces the error and retries from the keyboard', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ProductGridStatus status="error" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar los productos. Revisá tu conexión e intentá de nuevo.',
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
