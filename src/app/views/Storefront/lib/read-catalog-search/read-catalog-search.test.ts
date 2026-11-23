import { describe, expect, it } from 'vitest';
import { readCatalogSearch } from './read-catalog-search';

describe('readCatalogSearch', () => {
  it('defaults to page 1 without canonicalizing when page is absent', () => {
    expect(readCatalogSearch(new URLSearchParams())).toEqual({
      name: '',
      page: 1,
      size: 24,
      shouldCanonicalizeSearch: false,
    });
  });

  it('keeps a valid search term and page', () => {
    const params = new URLSearchParams({ name: 'mesa ratona', page: '3' });

    expect(readCatalogSearch(params)).toEqual({
      name: 'mesa ratona',
      page: 3,
      size: 24,
      shouldCanonicalizeSearch: false,
    });
  });

  it('trims the term and treats whitespace-only terms as no filter', () => {
    expect(readCatalogSearch(new URLSearchParams({ name: '  silla  ' })).name).toBe('silla');
    expect(readCatalogSearch(new URLSearchParams({ name: '    ' })).name).toBe('');
  });

  it('limits the term to 100 characters', () => {
    const longTerm = 'a'.repeat(150);

    expect(readCatalogSearch(new URLSearchParams({ name: longTerm })).name).toBe('a'.repeat(100));
  });

  it.each(['abc', '0', '-2', '1.5', '1e999', '', ' 2 '])(
    'canonicalizes the invalid page %j to page 1',
    (rawPage) => {
      const params = new URLSearchParams({ name: 'lampara', page: rawPage });

      expect(readCatalogSearch(params)).toEqual({
        name: 'lampara',
        page: 1,
        size: 24,
        shouldCanonicalizeSearch: true,
      });
    },
  );

  it('accepts large safe integers', () => {
    expect(readCatalogSearch(new URLSearchParams({ page: '9007199254740991' }))).toEqual({
      name: '',
      page: 9007199254740991,
      size: 24,
      shouldCanonicalizeSearch: false,
    });
  });

  it('canonicalizes pages beyond the safe integer range', () => {
    expect(readCatalogSearch(new URLSearchParams({ page: '9007199254740992' }))).toEqual({
      name: '',
      page: 1,
      size: 24,
      shouldCanonicalizeSearch: true,
    });
  });

  it('keeps a valid page size inside the allowed range', () => {
    expect(readCatalogSearch(new URLSearchParams({ size: '4' }))).toEqual({
      name: '',
      page: 1,
      size: 4,
      shouldCanonicalizeSearch: false,
    });
    expect(readCatalogSearch(new URLSearchParams({ size: '100' })).size).toBe(100);
  });

  it.each(['0', '-1', '4.5', 'abc', '101', ''])(
    'canonicalizes the invalid size %j to the default page size',
    (rawSize) => {
      expect(readCatalogSearch(new URLSearchParams({ size: rawSize }))).toEqual({
        name: '',
        page: 1,
        size: 24,
        shouldCanonicalizeSearch: true,
      });
    },
  );
});
