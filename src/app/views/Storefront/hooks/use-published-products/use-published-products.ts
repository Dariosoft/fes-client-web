import { useEffect, useState } from 'react';
import { getPublishedProducts } from '../../../../shared/api/catalog/get-published-products/get-published-products';
import type { PublishedProductsResponse } from '../../../../shared/api/catalog/types';

export type PublishedProductsState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: PublishedProductsResponse; error: null }
  | { status: 'error'; data: null; error: Error };

type SettledRequest =
  | { key: string; status: 'success'; data: PublishedProductsResponse }
  | { key: string; status: 'error'; error: Error };

const LOADING_STATE: PublishedProductsState = { status: 'loading', data: null, error: null };

function createRequestKey(name: string, page: number, attempt: number): string {
  return `${name}\u0000${String(page)}\u0000${String(attempt)}`;
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export function usePublishedProducts(
  name: string,
  page: number,
): { state: PublishedProductsState; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<SettledRequest | null>(null);
  const requestKey = createRequestKey(name, page, attempt);

  useEffect(() => {
    const controller = new AbortController();
    const effectKey = createRequestKey(name, page, attempt);

    getPublishedProducts({ name, page, signal: controller.signal }).then(
      (data) => {
        if (controller.signal.aborted) {
          return;
        }

        setSettled({ key: effectKey, status: 'success', data });
      },
      (error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setSettled({ key: effectKey, status: 'error', error: toError(error) });
      },
    );

    return () => {
      controller.abort();
    };
  }, [name, page, attempt]);

  const state: PublishedProductsState =
    settled?.key === requestKey
      ? settled.status === 'success'
        ? { status: 'success', data: settled.data, error: null }
        : { status: 'error', data: null, error: settled.error }
      : LOADING_STATE;

  function retry() {
    setAttempt((current) => current + 1);
  }

  return { state, retry };
}
