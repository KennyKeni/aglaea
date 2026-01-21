import type { Pokemon } from '$lib/types/pokemon';
import { GridDataStateImpl } from './grid-data.svelte';

const state = new GridDataStateImpl<Pokemon>([], 0, 1, {
  apiEndpoint: '/api/pokemon',
  queryParams: {
    includeTypes: true,
    includeAbilities: true,
  },
});

export const pokemonStore = {
  get items() {
    return state.items;
  },
  get isLoading() {
    return state.isLoading;
  },
  get isSearching() {
    return state.isSearching;
  },
  get searchQuery() {
    return state.searchQuery;
  },
  get currentPage() {
    return state.currentPage;
  },
  get totalPages() {
    return state.totalPages;
  },
  search: (query: string) => state.search(query),
  clearSearch: () => state.clearSearch(),
  setPage: (page: number) => state.setPage(page),
  setItems: (items: Pokemon[]) => state.setItems(items),
  setListParams: (params: URLSearchParams) => state.setListParams(params),
  getReturnHref: (basePath: string) => state.getReturnHref(basePath),
};
