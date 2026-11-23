import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductPageSize } from './ProductPageSize';

function renderPageSize(size = 24) {
  const onSelectSize = vi.fn();

  render(<ProductPageSize size={size} onSelectSize={onSelectSize} />);

  return { onSelectSize };
}

function openListbox() {
  return screen.getByRole('button', { name: 'Productos por página 24' });
}

describe('ProductPageSize', () => {
  it('shows the active size and keeps the options closed until asked', () => {
    renderPageSize();

    expect(openListbox()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('offers the allowed page sizes with the active one marked', async () => {
    const user = userEvent.setup();
    renderPageSize(48);

    await user.click(screen.getByRole('button', { name: 'Productos por página 48' }));

    const listbox = screen.getByRole('listbox', { name: 'Productos por página' });
    const options = within(listbox).getAllByRole('option');

    expect(options.map((option) => option.textContent)).toEqual(['12', '24', '48', '72', '100']);
    expect(within(listbox).getByRole('option', { name: '48' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('reports the selected page size and closes the list', async () => {
    const user = userEvent.setup();
    const { onSelectSize } = renderPageSize();

    await user.click(openListbox());
    await user.click(screen.getByRole('option', { name: '48' }));

    expect(onSelectSize).toHaveBeenCalledWith(48);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not report the size that is already active', async () => {
    const user = userEvent.setup();
    const { onSelectSize } = renderPageSize();

    await user.click(openListbox());
    await user.click(screen.getByRole('option', { name: '24' }));

    expect(onSelectSize).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes the list with Escape without changing the size', async () => {
    const user = userEvent.setup();
    const { onSelectSize } = renderPageSize();

    await user.click(openListbox());
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onSelectSize).not.toHaveBeenCalled();
  });

  it('selects with the keyboard', async () => {
    const user = userEvent.setup();
    const { onSelectSize } = renderPageSize();

    await user.click(openListbox());
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelectSize).toHaveBeenCalledWith(48);
  });
});
