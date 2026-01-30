import type { Article } from '$lib/types/article';
import { GridDataStateImpl } from './grid-data.svelte';

const state = new GridDataStateImpl<Article>([], 0, 1, {
  apiEndpoint: '/api/articles',
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
  get currentPage() {
    return state.currentPage;
  },
  get totalPages() {
    return state.totalPages;
  },
  setPage: (page: number) => state.setPage(page),
  setItems: (items: Article[]) => state.setItems(items),
  setListParams: (params: URLSearchParams) => state.setListParams(params),
  getReturnHref: (basePath: string) => state.getReturnHref(basePath),
};
