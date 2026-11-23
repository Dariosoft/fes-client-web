import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPublications } from '../../../../shared/api/catalog/get-publications/get-publications';
import type { PublicationsResponse } from '../../../../shared/api/catalog/types';
import { usePublications } from './use-publications';

vi.mock('../../../../shared/api/catalog/get-publications/get-publications');

const getPublicationsMock = vi.mocked(getPublications);

function catalogPage(page: number, totalPages = 3): PublicationsResponse {
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

describe('usePublications', () => {
  beforeEach(() => {
    getPublicationsMock.mockReset();
  });

  it('starts loading and resolves the first page', async () => {
    getPublicationsMock.mockResolvedValue(catalogPage(1));

    const { result } = renderHook(() => usePublications('', 1, 24));

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(result.current.state.data?.page).toBe(1);
    expect(getPublicationsMock).toHaveBeenCalledWith({
      name: '',
      page: 1,
      size: 24,
      signal: expect.any(AbortSignal) as AbortSignal,
    });
  });

  it('exposes an error when the request fails', async () => {
    getPublicationsMock.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => usePublications('', 1, 24));

    await waitFor(() => expect(result.current.state.status).toBe('error'));
    expect(result.current.state.error?.message).toBe('network down');
  });

  it('retries the request and recovers', async () => {
    getPublicationsMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(catalogPage(1));

    const { result } = renderHook(() => usePublications('', 1, 24));
    await waitFor(() => expect(result.current.state.status).toBe('error'));

    act(() => {
      result.current.retry();
    });

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(getPublicationsMock).toHaveBeenCalledTimes(2);
  });

  it('aborts the previous request and reloads when the query changes', () => {
    getPublicationsMock.mockImplementation(() => new Promise(() => undefined));

    const { result, rerender } = renderHook(({ page }) => usePublications('', page, 24), {
      initialProps: { page: 1 },
    });
    const firstSignal = getPublicationsMock.mock.calls[0]?.[0].signal;

    rerender({ page: 2 });

    expect(firstSignal?.aborted).toBe(true);
    expect(getPublicationsMock).toHaveBeenCalledTimes(2);
    expect(result.current.state.status).toBe('loading');
  });

  it('aborts on unmount', () => {
    getPublicationsMock.mockImplementation(() => new Promise(() => undefined));

    const { unmount } = renderHook(() => usePublications('', 1, 24));
    const signal = getPublicationsMock.mock.calls[0]?.[0].signal;

    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it('ignores a stale response that resolves after the query changed', async () => {
    const firstRequest = deferred<PublicationsResponse>();
    const secondRequest = deferred<PublicationsResponse>();
    getPublicationsMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);

    const { result, rerender } = renderHook(({ page }) => usePublications('', page, 24), {
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
    getPublicationsMock.mockImplementation(
      ({ signal }) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        }),
    );

    const { result, rerender } = renderHook(({ page }) => usePublications('', page, 24), {
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
