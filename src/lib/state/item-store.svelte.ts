import type { Item } from '$lib/types/item';
import { GridDataStateImpl } from './grid-data.svelte';

const state = new GridDataStateImpl<Item>([], 0, 1, {
	apiEndpoint: '/api/items',
	queryParams: {},
});

export const itemStore = {
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
	setItems: (items: Item[]) => state.setItems(items),
	setListParams: (params: URLSearchParams) => state.setListParams(params),
	getReturnHref: (basePath: string) => state.getReturnHref(basePath),
};
