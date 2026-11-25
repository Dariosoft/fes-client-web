import { describe, expect, it } from 'vitest';
import {
  buildCatalogHref,
  buildCatalogSearchParams,
  readCatalogReturnState,
} from './catalog-location';

describe('buildCatalogSearchParams', () => {
  it('only keeps the page for the default catalog location', () => {
    expect(buildCatalogSearchParams({ name: '', page: 1, size: 24 }).toString()).toBe('page=1');
  });

  it('builds the parameters in name, page and size order', () => {
    expect(
      buildCatalogSearchParams({ name: 'mesa ratona', page: 3, size: 48 }).toString(),
    ).toBe('name=mesa+ratona&page=3&size=48');
  });

  it('omits an empty name and the default page size', () => {
    expect(buildCatalogSearchParams({ name: '', page: 2, size: 24 }).toString()).toBe('page=2');
  });
});

describe('buildCatalogHref', () => {
  it('returns the root for the default catalog location', () => {
    expect(buildCatalogHref({ name: '', page: 1, size: 24 })).toBe('/');
  });

  it('builds a query string for a search context', () => {
    expect(buildCatalogHref({ name: 'mesa', page: 2, size: 48 })).toBe(
      '/?name=mesa&page=2&size=48',
    );
  });

  it('includes the page even when the name is empty', () => {
    expect(buildCatalogHref({ name: '', page: 2, size: 24 })).toBe('/?page=2');
  });
});

describe('readCatalogReturnState', () => {
  it('reads a valid from context', () => {
    expect(
      readCatalogReturnState({ from: { name: '  mesa  ', page: 2, size: 48 } }),
    ).toEqual({ name: 'mesa', page: 2, size: 48 });
  });

  it('accepts the maximum page size', () => {
    expect(readCatalogReturnState({ from: { name: '', page: 1, size: 100 } })).toEqual({
      name: '',
      page: 1,
      size: 100,
    });
  });

  it.each([
    undefined,
    null,
    'catalog',
    {},
    { from: null },
    { from: 'catalog' },
    { from: { name: 1, page: 1, size: 24 } },
    { from: { name: '', page: 0, size: 24 } },
    { from: { name: '', page: 1.5, size: 24 } },
    { from: { name: '', page: 1, size: 0 } },
    { from: { name: '', page: 1, size: 101 } },
    { from: { name: '', page: 1, size: 1.5 } },
    { from: { page: 1, size: 24 } },
    { from: { name: '', size: 24 } },
    { from: { name: '', page: 1 } },
  ])('rejects an invalid state %j', (state) => {
    expect(readCatalogReturnState(state)).toBeNull();
  });
});
