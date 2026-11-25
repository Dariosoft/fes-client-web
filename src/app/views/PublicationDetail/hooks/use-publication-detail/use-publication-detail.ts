import { useEffect, useState } from 'react';
import { getPublicShop } from '../../../../shared/api/account/get-public-shop/get-public-shop';
import type { PublicShop } from '../../../../shared/api/account/types';
import { getPublication } from '../../../../shared/api/catalog/get-publication/get-publication';
import type { PublicationDetail } from '../../../../shared/api/catalog/types';

export type PublicationDetailState =
  | { status: 'loading'; publication: null; shop: null }
  | { status: 'not-found'; publication: null; shop: null }
  | { status: 'error'; publication: null; shop: null; error: Error }
  | { status: 'success'; publication: PublicationDetail; shop: PublicShop | null };

type SettledPublication =
  | { key: string; status: 'success'; publication: PublicationDetail }
  | { key: string; status: 'not-found' }
  | { key: string; status: 'error'; error: Error };

type SettledShop = {
  key: string;
  shop: PublicShop | null;
};

const LOADING_STATE: PublicationDetailState = {
  status: 'loading',
  publication: null,
  shop: null,
};

const NOT_FOUND_STATE: PublicationDetailState = {
  status: 'not-found',
  publication: null,
  shop: null,
};

function createRequestKey(id: string, attempt: number): string {
  return `${id}\u0000${String(attempt)}`;
}

function createShopKey(requestKey: string, sellerAccountId: string): string {
  return `${requestKey}\u0000${sellerAccountId}`;
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export function usePublicationDetail(id: string | undefined): {
  state: PublicationDetailState;
  retry: () => void;
} {
  const [attempt, setAttempt] = useState(0);
  const [settledPublication, setSettledPublication] = useState<SettledPublication | null>(null);
  const [settledShop, setSettledShop] = useState<SettledShop | null>(null);
  const hasId = id !== undefined && id !== '';
  const requestKey = createRequestKey(id ?? '', attempt);

  useEffect(() => {
    if (id === undefined || id === '') {
      return;
    }

    const controller = new AbortController();
    const effectKey = createRequestKey(id, attempt);

    getPublication({ id, signal: controller.signal }).then(
      (publication) => {
        if (controller.signal.aborted) {
          return;
        }

        setSettledPublication(
          publication === null
            ? { key: effectKey, status: 'not-found' }
            : { key: effectKey, status: 'success', publication },
        );
      },
      (error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setSettledPublication({ key: effectKey, status: 'error', error: toError(error) });
      },
    );

    return () => {
      controller.abort();
    };
  }, [id, attempt]);

  const currentPublication = settledPublication?.key === requestKey ? settledPublication : null;
  const loadedPublication =
    currentPublication?.status === 'success' ? currentPublication.publication : null;
  const sellerAccountId = loadedPublication?.sellerAccountId;

  useEffect(() => {
    if (sellerAccountId === undefined) {
      return;
    }

    const controller = new AbortController();
    const effectKey = createShopKey(requestKey, sellerAccountId);

    getPublicShop({ sellerAccountId, signal: controller.signal }).then(
      (shop) => {
        if (controller.signal.aborted) {
          return;
        }

        setSettledShop({ key: effectKey, shop });
      },
      () => {
        if (controller.signal.aborted) {
          return;
        }

        setSettledShop({ key: effectKey, shop: null });
      },
    );

    return () => {
      controller.abort();
    };
  }, [requestKey, sellerAccountId]);

  function retry() {
    setAttempt((current) => current + 1);
  }

  if (!hasId) {
    return { state: NOT_FOUND_STATE, retry };
  }

  if (currentPublication === null) {
    return { state: LOADING_STATE, retry };
  }

  if (currentPublication.status === 'not-found') {
    return { state: NOT_FOUND_STATE, retry };
  }

  if (currentPublication.status === 'error') {
    return {
      state: { status: 'error', publication: null, shop: null, error: currentPublication.error },
      retry,
    };
  }

  const shopKey = createShopKey(requestKey, currentPublication.publication.sellerAccountId);
  const shop = settledShop?.key === shopKey ? settledShop.shop : null;

  return {
    state: { status: 'success', publication: currentPublication.publication, shop },
    retry,
  };
}
