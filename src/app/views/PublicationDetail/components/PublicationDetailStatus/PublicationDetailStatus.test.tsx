import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PublicationDetailStatus } from './PublicationDetailStatus';

describe('PublicationDetailStatus', () => {
  it('announces the loading state politely', () => {
    render(<PublicationDetailStatus status="loading" />);

    const status = screen.getByRole('status');

    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Cargando publicación…');
    expect(screen.getByRole('heading', { level: 1, name: 'Cargando publicación…' })).toBeInTheDocument();
  });

  it('shows the not found title and message', () => {
    render(<PublicationDetailStatus status="not-found" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Publicación no encontrada' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La publicación no existe o ya no está disponible.'),
    ).toBeInTheDocument();
  });

  it('shows an error alert with a retry button of at least 44px', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<PublicationDetailStatus status="error" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar la publicación');
    expect(screen.getByText('Revisá tu conexión e intentá de nuevo.')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Reintentar' });

    expect(retryButton).toHaveClass('min-h-11');
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('retries from the keyboard', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<PublicationDetailStatus status="error" onRetry={onRetry} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
