import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPublishedProducts } from '../../../../shared/api/catalog/get-published-products/get-published-products';
import type { PublishedProductsResponse } from '../../../../shared/api/catalog/types';
import { usePublishedProducts } from './use-published-products';

vi.mock('../../../../shared/api/catalog/get-published-products/get-published-products');

const getPublishedProductsMock = vi.mocked(getPublishedProducts);

function catalogPage(page: number, totalPages = 3): PublishedProductsResponse {
  return {
    items: [
      {
        id: `product-${String(page)}`,
        name: 'Silla de madera',
        price: 12000,
        currency: 'ARS',
        stock: 4,
        images: [],
      },
    ],
    page,
    size: 24,
    totalItems: 30,
    totalPages,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe('usePublishedProducts', () => {
  beforeEach(() => {
    getPublishedProductsMock.mockReset();
  });

  it('starts loading and resolves the first page', async () => {
    getPublishedProductsMock.mockResolvedValue(catalogPage(1));

    const { result } = renderHook(() => usePublishedProducts('', 1, 24));

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(result.current.state.data?.page).toBe(1);
    expect(getPublishedProductsMock).toHaveBeenCalledWith({
      name: '',
      page: 1,
      size: 24,
      signal: expect.any(AbortSignal) as AbortSignal,
    });
  });

  it('exposes an error when the request fails', async () => {
    getPublishedProductsMock.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => usePublishedProducts('', 1, 24));

    await waitFor(() => expect(result.current.state.status).toBe('error'));
    expect(result.current.state.error?.message).toBe('network down');
  });

  it('retries the request and recovers', async () => {
    getPublishedProductsMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(catalogPage(1));

    const { result } = renderHook(() => usePublishedProducts('', 1, 24));
    await waitFor(() => expect(result.current.state.status).toBe('error'));

    act(() => {
      result.current.retry();
    });

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(getPublishedProductsMock).toHaveBeenCalledTimes(2);
  });

  it('aborts the previous request and reloads when the query changes', () => {
    getPublishedProductsMock.mockImplementation(() => new Promise(() => undefined));

    const { result, rerender } = renderHook(({ page }) => usePublishedProducts('', page, 24), {
      initialProps: { page: 1 },
    });
    const firstSignal = getPublishedProductsMock.mock.calls[0]?.[0].signal;

    rerender({ page: 2 });

    expect(firstSignal?.aborted).toBe(true);
    expect(getPublishedProductsMock).toHaveBeenCalledTimes(2);
    expect(result.current.state.status).toBe('loading');
  });

  it('aborts on unmount', () => {
    getPublishedProductsMock.mockImplementation(() => new Promise(() => undefined));

    const { unmount } = renderHook(() => usePublishedProducts('', 1, 24));
    const signal = getPublishedProductsMock.mock.calls[0]?.[0].signal;

    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it('ignores a stale response that resolves after the query changed', async () => {
    const firstRequest = deferred<PublishedProductsResponse>();
    const secondRequest = deferred<PublishedProductsResponse>();
    getPublishedProductsMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);

    const { result, rerender } = renderHook(({ page }) => usePublishedProducts('', page, 24), {
      initialProps: { page: 1 },
    });

    rerender({ page: 2 });
    secondRequest.resolve(catalogPage(2));
    await act(async () => {
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.state.data?.page).toBe(2));

    firstRequest.resolve(catalogPage(1));
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state.data?.page).toBe(2);
  });

  it('does not turn an abort into an error', async () => {
    getPublishedProductsMock.mockImplementation(
      ({ signal }) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        }),
    );

    const { result, rerender } = renderHook(({ page }) => usePublishedProducts('', page, 24), {
      initialProps: { page: 1 },
    });

    rerender({ page: 2 });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state.status).toBe('loading');
    expect(result.current.state.error).toBeNull();
  });
});
