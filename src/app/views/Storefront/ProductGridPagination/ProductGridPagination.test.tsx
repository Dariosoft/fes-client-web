import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductGridPagination } from './ProductGridPagination';

describe('ProductGridPagination', () => {
  it('shows every page and the current page totals', () => {
    render(<ProductGridPagination page={2} totalPages={3} onSelectPage={vi.fn()} />);

    expect(screen.getByRole('navigation', { name: 'Paginación del catálogo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Página 3' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('notifies the chosen page', async () => {
    const user = userEvent.setup();
    const onSelectPage = vi.fn();
    render(<ProductGridPagination page={1} totalPages={4} onSelectPage={onSelectPage} />);

    await user.click(screen.getByRole('button', { name: 'Página 3' }));

    expect(onSelectPage).toHaveBeenCalledWith(3);
  });

  it('keeps a window of at most seven pages and marks the gaps', () => {
    render(<ProductGridPagination page={5} totalPages={20} onSelectPage={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 20' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByText('…', { selector: '[aria-hidden="true"]' })).not.toHaveLength(0);
    expect(screen.getByText('Página 5 de 20')).toBeInTheDocument();
  });

  it('renders nothing when there is a single page', () => {
    const { container } = render(
      <ProductGridPagination page={1} totalPages={1} onSelectPage={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
