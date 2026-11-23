import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProductGridPagination } from './ProductGridPagination';

function stubAvailableWidth(availableWidth: number, buttonWidth = 44) {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(availableWidth);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(buttonWidth);
}

describe('ProductGridPagination', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows every page and the current page totals', () => {
    render(<ProductGridPagination page={2} totalPages={3} onSelectPage={vi.fn()} />);

    expect(screen.getByRole('navigation', { name: 'Paginación del catálogo' })).toBeInTheDocument();

    const pages = within(screen.getByRole('list', { name: 'Páginas' }));

    expect(pages.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(pages.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    expect(pages.getByRole('button', { name: 'Página 3' })).not.toHaveAttribute('aria-current');
    expect(pages.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('notifies the chosen page', async () => {
    const user = userEvent.setup();
    const onSelectPage = vi.fn();
    render(<ProductGridPagination page={1} totalPages={4} onSelectPage={onSelectPage} />);

    await user.click(screen.getByRole('button', { name: 'Página 3' }));

    expect(onSelectPage).toHaveBeenCalledWith(3);
  });

  it('keeps a window of at most five pages and marks the gaps', () => {
    render(<ProductGridPagination page={5} totalPages={20} onSelectPage={vi.fn()} />);

    const pages = within(screen.getByRole('list', { name: 'Páginas' }));

    expect(pages.getAllByRole('button')).toHaveLength(5);
    expect(pages.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(pages.getByRole('button', { name: 'Página 20' })).toBeInTheDocument();
    expect(pages.getByRole('button', { name: 'Página 5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByText('…', { selector: '[aria-hidden="true"]' })).toHaveLength(2);
  });

  it('shows the page legend above the page buttons', () => {
    render(<ProductGridPagination page={5} totalPages={20} onSelectPage={vi.fn()} />);

    const legend = screen.getByText('Página 5 de 20');
    const list = screen.getByRole('list', { name: 'Páginas' });

    expect(legend.compareDocumentPosition(list)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('grows the window when the pagination has room', async () => {
    stubAvailableWidth(1200);

    render(<ProductGridPagination page={20} totalPages={40} onSelectPage={vi.fn()} />);

    const pages = within(screen.getByRole('list', { name: 'Páginas' }));

    await waitFor(() => {
      expect(pages.getAllByRole('button')).toHaveLength(9);
    });
    expect(pages.getByRole('button', { name: 'Página 20' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the small window when the pagination has little room', async () => {
    stubAvailableWidth(300);

    render(<ProductGridPagination page={20} totalPages={40} onSelectPage={vi.fn()} />);

    const pages = within(screen.getByRole('list', { name: 'Páginas' }));

    await waitFor(() => {
      expect(pages.getAllByRole('button')).toHaveLength(5);
    });
  });

  it('renders nothing when there is a single page', () => {
    const { container } = render(
      <ProductGridPagination page={1} totalPages={1} onSelectPage={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
