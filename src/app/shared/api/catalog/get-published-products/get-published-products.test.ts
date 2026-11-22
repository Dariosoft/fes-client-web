import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPublishedProducts } from './get-published-products';

const validResponse = {
  items: [
    {
      id: 'product-1',
      name: 'Zapatillas urbanas',
      price: 45999.5,
      currency: 'ARS',
      stock: 3,
      images: [{ id: 'image-1', url: 'https://cdn.friendly-e-shop.test/zapatillas.webp' }],
    },
  ],
  page: 1,
  size: 24,
  totalItems: 57,
  totalPages: 3,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function firstFetchCall() {
  return vi.mocked(globalThis.fetch).mock.calls[0];
}

describe('getPublishedProducts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('requests the published products with page, size and no credentials', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(validResponse));

    await expect(getPublishedProducts({ name: '', page: 2 })).resolves.toEqual(validResponse);

    expect(firstFetchCall()?.[0]).toBe(
      'http://api.friendly-e-shop.test/catalog/publish?page=2&size=24',
    );
    expect(firstFetchCall()?.[1]?.credentials).toBe('omit');
    expect(firstFetchCall()?.[1]?.headers).toEqual({ Accept: 'application/json' });
  });

  it('adds the name parameter only when there is a search term', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(validResponse));

    await getPublishedProducts({ name: 'zapatillas urbanas', page: 1 });

    expect(firstFetchCall()?.[0]).toBe(
      'http://api.friendly-e-shop.test/catalog/publish?name=zapatillas+urbanas&page=1&size=24',
    );
  });

  it('forwards the abort signal to fetch', async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(validResponse));

    await getPublishedProducts({ name: '', page: 1, signal: controller.signal });

    expect(firstFetchCall()?.[1]?.signal).toBe(controller.signal);
  });

  it('rejects a failed request with the HTTP status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 503));

    await expect(getPublishedProducts({ name: '', page: 1 })).rejects.toThrow(
      'Catalog request failed with status 503',
    );
  });

  it('rejects an invalid JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('no es json', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    await expect(getPublishedProducts({ name: '', page: 1 })).rejects.toThrow();
  });

  it('rejects a response missing required fields', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ items: [], page: 1, size: 24, totalItems: 0 }),
    );

    await expect(getPublishedProducts({ name: '', page: 1 })).rejects.toThrow(
      'Catalog response shape is invalid',
    );
  });

  it('rejects a product with an invalid price or images', async () => {
    const invalidPrice = {
      ...validResponse,
      items: [{ ...validResponse.items[0], price: '45999.50' }],
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(invalidPrice));

    await expect(getPublishedProducts({ name: '', page: 1 })).rejects.toThrow(
      'Catalog response shape is invalid',
    );

    const invalidImages = {
      ...validResponse,
      items: [{ ...validResponse.items[0], images: [{ id: 'image-1' }] }],
    };
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(invalidImages));

    await expect(getPublishedProducts({ name: '', page: 1 })).rejects.toThrow(
      'Catalog response shape is invalid',
    );
  });

  it('propagates the abort error from fetch', async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    );

    await expect(
      getPublishedProducts({ name: '', page: 1, signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('accepts an empty catalog as a valid response', async () => {
    const emptyCatalog = { items: [], page: 1, size: 24, totalItems: 0, totalPages: 0 };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(emptyCatalog));

    await expect(getPublishedProducts({ name: '', page: 1 })).resolves.toEqual(emptyCatalog);
  });
});
