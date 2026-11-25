import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPublicShop } from '../../../../shared/api/account/get-public-shop/get-public-shop';
import type { PublicShop } from '../../../../shared/api/account/types';
import { getPublication } from '../../../../shared/api/catalog/get-publication/get-publication';
import type { PublicationDetail } from '../../../../shared/api/catalog/types';
import { usePublicationDetail } from './use-publication-detail';

vi.mock('../../../../shared/api/catalog/get-publication/get-publication');
vi.mock('../../../../shared/api/account/get-public-shop/get-public-shop');

const getPublicationMock = vi.mocked(getPublication);
const getPublicShopMock = vi.mocked(getPublicShop);

function buildPublication(overrides: Partial<PublicationDetail> = {}): PublicationDetail {
  return {
    id: 'product-1',
    name: 'Zapatillas urbanas',
    price: 45999.5,
    currency: 'ARS',
    stock: 3,
    description: 'Suela de goma.',
    sellerAccountId: 'seller-1',
    images: [],
    ...overrides,
  };
}

const shop: PublicShop = { name: 'Bazar del Sur', description: null };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('usePublicationDetail', () => {
  beforeEach(() => {
    getPublicationMock.mockReset();
    getPublicShopMock.mockReset();
  });

  it('loads the publication and then its shop', async () => {
    getPublicationMock.mockResolvedValue(buildPublication());
    getPublicShopMock.mockResolvedValue(shop);

    const { result } = renderHook(() => usePublicationDetail('product-1'));

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(result.current.state.publication?.name).toBe('Zapatillas urbanas');

    await waitFor(() => expect(result.current.state.shop?.name).toBe('Bazar del Sur'));
    expect(getPublicationMock).toHaveBeenCalledWith({
      id: 'product-1',
      signal: expect.any(AbortSignal) as AbortSignal,
    });
    expect(getPublicShopMock).toHaveBeenCalledWith({
      sellerAccountId: 'seller-1',
      signal: expect.any(AbortSignal) as AbortSignal,
    });
  });

  it('keeps the publication when the shop is not found', async () => {
    getPublicationMock.mockResolvedValue(buildPublication());
    getPublicShopMock.mockResolvedValue(null);

    const { result } = renderHook(() => usePublicationDetail('product-1'));

    await waitFor(() => expect(result.current.state.status).toBe('success'));
    await waitFor(() => expect(getPublicShopMock).toHaveBeenCalledTimes(1));
    await flushPromises();

    expect(result.current.state.status).toBe('success');
    expect(result.current.state.shop).toBeNull();
  });

  it('keeps the publication when the shop request fails', async () => {
    getPublicationMock.mockResolvedValue(buildPublication());
    getPublicShopMock.mockRejectedValue(new Error('account down'));

    const { result } = renderHook(() => usePublicationDetail('product-1'));

    await waitFor(() => expect(result.current.state.status).toBe('success'));
    await waitFor(() => expect(getPublicShopMock).toHaveBeenCalledTimes(1));
    await flushPromises();

    expect(result.current.state.status).toBe('success');
    expect(result.current.state.shop).toBeNull();
  });

  it('reports a not found publication without querying the shop', async () => {
    getPublicationMock.mockResolvedValue(null);

    const { result } = renderHook(() => usePublicationDetail('missing'));

    await waitFor(() => expect(result.current.state.status).toBe('not-found'));
    expect(result.current.state.publication).toBeNull();
    expect(getPublicShopMock).not.toHaveBeenCalled();
  });

  it('reports an error when the publication request fails', async () => {
    getPublicationMock.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => usePublicationDetail('product-1'));

    await waitFor(() => expect(result.current.state.status).toBe('error'));
    expect(result.current.state.status === 'error' && result.current.state.error.message).toBe(
      'network down',
    );
  });

  it('retries the request and recovers', async () => {
    getPublicationMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(buildPublication());
    getPublicShopMock.mockResolvedValue(shop);

    const { result } = renderHook(() => usePublicationDetail('product-1'));
    await waitFor(() => expect(result.current.state.status).toBe('error'));

    act(() => {
      result.current.retry();
    });

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(getPublicationMock).toHaveBeenCalledTimes(2);
  });

  it.each([undefined, ''])('does not request a publication without id %j', (id) => {
    const { result } = renderHook(() => usePublicationDetail(id));

    expect(result.current.state.status).toBe('not-found');
    expect(getPublicationMock).not.toHaveBeenCalled();
    expect(getPublicShopMock).not.toHaveBeenCalled();
  });

  it('aborts the previous request and reloads when the id changes', () => {
    getPublicationMock.mockImplementation(() => new Promise(() => undefined));

    const { result, rerender } = renderHook(({ id }) => usePublicationDetail(id), {
      initialProps: { id: 'product-1' },
    });
    const firstSignal = getPublicationMock.mock.calls[0]?.[0].signal;

    rerender({ id: 'product-2' });

    expect(firstSignal?.aborted).toBe(true);
    expect(getPublicationMock).toHaveBeenCalledTimes(2);
    expect(result.current.state.status).toBe('loading');
  });

  it('aborts the publication and shop requests on unmount', async () => {
    getPublicationMock.mockResolvedValue(buildPublication());
    getPublicShopMock.mockImplementation(() => new Promise(() => undefined));

    const { result, unmount } = renderHook(() => usePublicationDetail('product-1'));
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    await waitFor(() => expect(getPublicShopMock).toHaveBeenCalledTimes(1));

    const publicationSignal = getPublicationMock.mock.calls[0]?.[0].signal;
    const shopSignal = getPublicShopMock.mock.calls[0]?.[0].signal;

    unmount();

    expect(publicationSignal?.aborted).toBe(true);
    expect(shopSignal?.aborted).toBe(true);
  });

  it('ignores a stale publication response that resolves after the id changed', async () => {
    const firstRequest = deferred<PublicationDetail | null>();
    const secondRequest = deferred<PublicationDetail | null>();
    getPublicationMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    getPublicShopMock.mockResolvedValue(null);

    const { result, rerender } = renderHook(({ id }) => usePublicationDetail(id), {
      initialProps: { id: 'product-1' },
    });

    rerender({ id: 'product-2' });
    secondRequest.resolve(buildPublication({ id: 'product-2', name: 'Producto 2' }));
    await waitFor(() => expect(result.current.state.status).toBe('success'));

    firstRequest.resolve(buildPublication({ id: 'product-1', name: 'Producto 1' }));
    await flushPromises();

    expect(result.current.state.status).toBe('success');
    expect(result.current.state.publication?.id).toBe('product-2');
  });

  it('does not turn an abort into an error', async () => {
    getPublicationMock.mockImplementation(
      ({ signal }) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        }),
    );

    const { result, rerender } = renderHook(({ id }) => usePublicationDetail(id), {
      initialProps: { id: 'product-1' },
    });

    rerender({ id: 'product-2' });
    await flushPromises();

    expect(result.current.state.status).toBe('loading');
  });
});
