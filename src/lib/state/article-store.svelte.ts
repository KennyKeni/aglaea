import type { Article } from '$lib/types/article';
import { GridDataStateImpl } from './grid-data.svelte';

const state = new GridDataStateImpl<Article>([], 0, 1, {
  apiEndpoint: '/api/articles',
  searchParam: 'title',
  queryParams: {
    includeCategories: true,
    includeImages: true,
  },
});

export const articleStore = {
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
  setItems: (items: Article[]) => state.setItems(items),
  setListParams: (params: URLSearchParams) => state.setListParams(params),
  getReturnHref: (basePath: string) => state.getReturnHref(basePath),
};
