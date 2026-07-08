import { resolve } from '$app/paths';
import type { SearchResult } from '$lib/types/search';

export function searchResultUrl(result: SearchResult): string {
  switch (result.source) {
    case 'pokemon':
      return resolve('/pokemon/[id]', { id: result.slug });
    case 'moves':
      return resolve('/moves/[id]', { id: String(result.id) });
    case 'abilities':
      return resolve('/abilities/[id]', { id: String(result.id) });
    case 'items':
      return resolve('/items/[id]', { id: String(result.id) });
    case 'types':
      return `${resolve('/pokemon')}?types=${encodeURIComponent(result.slug)}`;
  }
}
