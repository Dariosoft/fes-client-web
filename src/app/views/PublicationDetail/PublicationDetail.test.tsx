import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getPublicShop } from '../../shared/api/account/get-public-shop/get-public-shop';
import type { PublicShop } from '../../shared/api/account/types';
import { getPublication } from '../../shared/api/catalog/get-publication/get-publication';
import type { PublicationDetail as PublicationDetailData } from '../../shared/api/catalog/types';
import { PublicationDetail } from './PublicationDetail';

vi.mock('../../shared/api/catalog/get-publication/get-publication');
vi.mock('../../shared/api/account/get-public-shop/get-public-shop');

const getPublicationMock = vi.mocked(getPublication);
const getPublicShopMock = vi.mocked(getPublicShop);

function buildPublication(overrides: Partial<PublicationDetailData> = {}): PublicationDetailData {
  return {
    id: 'product-1',
    name: 'Zapatillas urbanas',
    price: 45999.5,
    currency: 'ARS',
    stock: 3,
    description: 'Suela de goma, talle 42, uso diario.',
    sellerAccountId: 'seller-1',
    images: [{ id: 'image-1', url: 'https://cdn.fes.test/zapatillas.webp' }],
    ...overrides,
  };
}

const shop: PublicShop = { name: 'Bazar del Sur', description: null };

function LocationProbe() {
  const location = useLocation();

  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

type RenderDetailOptions = {
  id?: string;
  state?: unknown;
};

function renderDetail({ id = 'product-1', state }: RenderDetailOptions = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: `/publication/${id}`, state }]}>
      <Routes>
        <Route path="/publication/:id" element={<PublicationDetail />} />
        <Route path="/" element={<><p>Catálogo</p><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicationDetail', () => {
  beforeEach(() => {
    getPublicationMock.mockReset();
    getPublicShopMock.mockReset();
    getPublicShopMock.mockResolvedValue(null);
  });

  it('shows the loading state while keeping the back link available', () => {
    getPublicationMock.mockImplementation(() => new Promise(() => undefined));

    renderDetail();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando publicación…');
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeInTheDocument();
  });

  it('shows the not found state', async () => {
    getPublicationMock.mockResolvedValue(null);

    renderDetail();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Publicación no encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeInTheDocument();
  });

  it('shows an error and retries the publication', async () => {
    const user = userEvent.setup();
    getPublicationMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(buildPublication());

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar la publicación');
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Zapatillas urbanas' }),
    ).toBeInTheDocument();
    expect(getPublicationMock).toHaveBeenCalledTimes(2);
  });

  it('renders the full publication with its shop', async () => {
    getPublicationMock.mockResolvedValue(buildPublication());
    getPublicShopMock.mockResolvedValue(shop);

    renderDetail();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Zapatillas urbanas' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Zapatillas urbanas' })).toBeInTheDocument();
    expect(screen.getByText(/\$\s45\.999,50/)).toBeInTheDocument();
    expect(screen.getByText('3 disponibles')).toBeInTheDocument();
    expect(screen.getByText('Suela de goma, talle 42, uso diario.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Tienda' })).toBeInTheDocument();
    expect(screen.getByText('Bazar del Sur')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/carrito|checkout|comprar ahora/i)).not.toBeInTheDocument();
  });

  it('shows unlimited stock and the alternative description', async () => {
    getPublicationMock.mockResolvedValue(buildPublication({ stock: null, description: null }));

    renderDetail();

    expect(await screen.findByText('Disponible')).toBeInTheDocument();
    expect(screen.getByText('Este producto no tiene descripción.')).toBeInTheDocument();
  });

  it('hides the shop block when there is no shop', async () => {
    getPublicationMock.mockResolvedValue(buildPublication());
    getPublicShopMock.mockResolvedValue(null);

    renderDetail();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Zapatillas urbanas' }),
    ).toBeInTheDocument();
    await waitFor(() => expect(getPublicShopMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('heading', { name: 'Tienda' })).not.toBeInTheDocument();
  });

  it('returns to the catalog preserving a valid search context', async () => {
    const user = userEvent.setup();
    getPublicationMock.mockResolvedValue(buildPublication());

    renderDetail({
      state: { from: { name: 'mesa', page: 2, size: 48 } },
    });

    const backLink = await screen.findByRole('link', { name: 'Volver al catálogo' });

    expect(backLink).toHaveAttribute('href', '/?name=mesa&page=2&size=48');
    await user.click(backLink);

    expect(screen.getByTestId('location')).toHaveTextContent('/?name=mesa&page=2&size=48');
  });

  it('returns to the default catalog without a valid context', async () => {
    const user = userEvent.setup();
    getPublicationMock.mockResolvedValue(buildPublication());

    renderDetail({ state: { from: { name: '', page: 0, size: 24 } } });

    const backLink = await screen.findByRole('link', { name: 'Volver al catálogo' });

    expect(backLink).toHaveAttribute('href', '/');
    await user.click(backLink);

    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });
});
