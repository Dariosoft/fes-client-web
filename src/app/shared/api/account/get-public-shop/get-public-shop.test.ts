import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPublicShop } from './get-public-shop';

const validResponse = {
  name: 'Bazar del Sur',
  description: 'Artículos para el hogar.',
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

describe('getPublicShop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('requests the encoded shop with public credentials', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.friendly-e-shop.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(validResponse));

    await expect(getPublicShop({ sellerAccountId: 'seller/1' })).resolves.toEqual(validResponse);

    expect(firstFetchCall()?.[0]).toBe(
      'http://api.friendly-e-shop.test/accounts/shops/seller%2F1',
    );
    expect(firstFetchCall()?.[1]?.credentials).toBe('omit');
    expect(firstFetchCall()?.[1]?.headers).toEqual({ Accept: 'application/json' });
  });

  it('forwards the abort signal to fetch', async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(validResponse));

    await getPublicShop({ sellerAccountId: 'seller-1', signal: controller.signal });

    expect(firstFetchCall()?.[1]?.signal).toBe(controller.signal);
  });

  it('returns null when the seller has no configured shop', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 404));

    await expect(getPublicShop({ sellerAccountId: 'seller-1' })).resolves.toBeNull();
  });

  it('rejects a failed request with the HTTP status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 500));

    await expect(getPublicShop({ sellerAccountId: 'seller-1' })).rejects.toThrow(
      'Shop request failed with status 500',
    );
  });

  it('rejects an invalid JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('no es json', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    await expect(getPublicShop({ sellerAccountId: 'seller-1' })).rejects.toThrow();
  });

  it('accepts a shop without description', async () => {
    const withoutDescription = { name: 'Bazar del Sur', description: null };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(withoutDescription));

    await expect(getPublicShop({ sellerAccountId: 'seller-1' })).resolves.toEqual(
      withoutDescription,
    );
  });

  it.each([
    ['a missing name', { description: null }],
    ['an empty name', { name: '', description: null }],
    ['a non-string description', { name: 'Bazar del Sur', description: 42 }],
  ])('rejects a response with %s', (_label, body) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(body));

    return expect(getPublicShop({ sellerAccountId: 'seller-1' })).rejects.toThrow(
      'Shop response shape is invalid',
    );
  });

  it('propagates the abort error from fetch', async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    );

    await expect(
      getPublicShop({ sellerAccountId: 'seller-1', signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
