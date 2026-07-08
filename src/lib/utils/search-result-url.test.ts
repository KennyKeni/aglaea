import { describe, expect, it } from 'vitest';
import { searchResultUrl } from './search-result-url';
import type { SearchResult, SearchSourceKind } from '$lib/types/search';

function result(source: SearchSourceKind, overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    id: 123,
    name: 'Result',
    slug: 'result-slug',
    source,
    ...overrides,
  };
}

describe('searchResultUrl', () => {
  it('uses Pokemon species slugs for Pokemon results', () => {
    expect(searchResultUrl(result('pokemon', { id: 1, slug: 'bulbasaur' }))).toBe(
      '/pokemon/bulbasaur',
    );
  });

  it('keeps numeric IDs for entity detail results that still route by ID', () => {
    expect(searchResultUrl(result('moves', { id: 15, slug: 'cut' }))).toBe('/moves/15');
    expect(searchResultUrl(result('abilities', { id: 65, slug: 'overgrow' }))).toBe(
      '/abilities/65',
    );
    expect(searchResultUrl(result('items', { id: 42, slug: 'oran-berry' }))).toBe('/items/42');
  });

  it('keeps type results as Pokemon list filters', () => {
    expect(searchResultUrl(result('types', { id: 10, slug: 'fire/flying' }))).toBe(
      '/pokemon?types=fire%2Fflying',
    );
  });
});
