import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Link, MemoryRouter, useLocation } from 'react-router-dom';
import { ProductSearch } from './ProductSearch';

function LocationProbe() {
  const location = useLocation();

  return (
    <>
      <p data-testid="location">{`${location.pathname}${location.search}`}</p>
      <Link to="/?name=mesa&page=1">Ir a mesas</Link>
    </>
  );
}

function renderSearch(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ProductSearch />
      <LocationProbe />
    </MemoryRouter>,
  );
}

function currentLocation(): string {
  return screen.getByTestId('location').textContent ?? '';
}

describe('ProductSearch', () => {
  it('renders a search form that reflects the name from the URL', () => {
    renderSearch('/?name=silla&page=2');

    expect(screen.getByRole('search', { name: 'Buscar productos' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toHaveValue(
      'silla',
    );
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('applies the term with Enter and resets to page 1', async () => {
    const user = userEvent.setup();
    renderSearch();
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar productos por nombre' });

    await user.type(searchbox, 'mesa ratona{Enter}');

    expect(currentLocation()).toBe('/?page=1&name=mesa+ratona');
  });

  it('applies the term with the magnifier button', async () => {
    const user = userEvent.setup();
    renderSearch('/?name=viejo&page=4');
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar productos por nombre' });

    await user.clear(searchbox);
    await user.type(searchbox, 'lampara');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(currentLocation()).toBe('/?page=1&name=lampara');
  });

  it('limits the applied term to 100 characters', async () => {
    const user = userEvent.setup();
    renderSearch();
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar productos por nombre' });

    expect(searchbox).toHaveAttribute('maxlength', '100');

    await user.click(searchbox);
    fireEvent.change(searchbox, { target: { value: 'a'.repeat(150) } });
    await user.keyboard('{Enter}');

    expect(currentLocation()).toBe(`/?page=1&name=${'a'.repeat(100)}`);
  });

  it('omits the name when the term is empty or whitespace', async () => {
    const user = userEvent.setup();
    renderSearch('/?name=silla&page=3');
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar productos por nombre' });

    await user.clear(searchbox);
    await user.type(searchbox, '   ');
    await user.keyboard('{Enter}');

    expect(currentLocation()).toBe('/?page=1');
  });

  it('does not navigate while the visitor types', async () => {
    const user = userEvent.setup();
    renderSearch('/?name=silla&page=2');

    await user.type(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' }), 'azul');

    expect(currentLocation()).toBe('/?name=silla&page=2');
  });

  it('syncs the input with searches applied elsewhere', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(screen.getByRole('link', { name: 'Ir a mesas' }));

    expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toHaveValue(
      'mesa',
    );
  });
});
