import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPublication } from './get-publication';

const validResponse = {
  id: 'product-1',
  name: 'Zapatillas urbanas',
  price: 45999.5,
  currency: 'ARS',
  stock: 3,
  description: 'Suela de goma, talle 42, uso diario.',
  sellerAccountId: 'seller-1',
  images: [{ id: 'image-1', url: 'https://cdn.friendly-e-shop.test/zapatillas.webp' }],
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

describe('getPublication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('requests the encoded publication with public credentials', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(validResponse));

    await expect(getPublication({ id: 'product/1' })).resolves.toEqual(validResponse);

    expect(firstFetchCall()?.[0]).toBe(
      'http://api.friendly-e-shop.test/catalog/publication/product%2F1',
    );
    expect(firstFetchCall()?.[1]?.credentials).toBe('omit');
    expect(firstFetchCall()?.[1]?.headers).toEqual({ Accept: 'application/json' });
  });

  it('forwards the abort signal to fetch', async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(validResponse));

    await getPublication({ id: 'product-1', signal: controller.signal });

    expect(firstFetchCall()?.[1]?.signal).toBe(controller.signal);
  });

  it('returns null when the publication is not found', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 404));

    await expect(getPublication({ id: 'product-1' })).resolves.toBeNull();
  });

  it('rejects a failed request with the HTTP status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 503));

    await expect(getPublication({ id: 'product-1' })).rejects.toThrow(
      'Publication request failed with status 503',
    );
  });

  it('rejects an invalid JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('no es json', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    await expect(getPublication({ id: 'product-1' })).rejects.toThrow();
  });

  it('accepts a publication without stock or description', async () => {
    const withoutOptionalFields = { ...validResponse, stock: null, description: null };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(withoutOptionalFields));

    await expect(getPublication({ id: 'product-1' })).resolves.toEqual(withoutOptionalFields);
  });

  it.each([
    ['a missing id', { ...validResponse, id: '' }],
    ['a non-string name', { ...validResponse, name: 1 }],
    ['a non-finite price', { ...validResponse, price: null }],
    ['an empty currency', { ...validResponse, currency: '' }],
    ['a negative stock', { ...validResponse, stock: -1 }],
    ['a fractional stock', { ...validResponse, stock: 1.5 }],
    ['a non-string description', { ...validResponse, description: 42 }],
    ['a missing seller', { ...validResponse, sellerAccountId: '' }],
    ['a non-array images field', { ...validResponse, images: null }],
    ['an image without url', { ...validResponse, images: [{ id: 'image-1' }] }],
    ['an empty image url', { ...validResponse, images: [{ id: 'image-1', url: '' }] }],
  ])('rejects a response with %s', (_label, body) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(body));

    return expect(getPublication({ id: 'product-1' })).rejects.toThrow(
      'Publication response shape is invalid',
    );
  });

  it('propagates the abort error from fetch', async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    );

    await expect(
      getPublication({ id: 'product-1', signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
