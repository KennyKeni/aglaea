import type { Pokemon } from '$lib/types/pokemon';
import { GridDataStateImpl } from './grid-data.svelte';

const state = new GridDataStateImpl<Pokemon>([], 0, 1, {
  apiEndpoint: '/api/pokemon/species',
  queryParams: {
    include: 'forms,types,abilities',
  },
});

export const pokemonStore = {
  get items() {
    return state.items;
  },
  get isLoading() {
    return state.isLoading;
  },
  get currentPage() {
    return state.currentPage;
  },
  get totalPages() {
    return state.totalPages;
  },
  setPage: (page: number) => state.setPage(page),
  setItems: (items: Pokemon[]) => state.setItems(items),
  setListParams: (params: URLSearchParams) => state.setListParams(params),
  getReturnHref: (basePath: string) => state.getReturnHref(basePath),
};
