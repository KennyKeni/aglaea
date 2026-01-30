import type { Move } from '$lib/types/move';
import { GridDataStateImpl } from './grid-data.svelte';

const state = new GridDataStateImpl<Move>([], 0, 1, {
	apiEndpoint: '/api/moves',
	queryParams: {},
});

export const moveStore = {
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
	setItems: (items: Move[]) => state.setItems(items),
	setListParams: (params: URLSearchParams) => state.setListParams(params),
	getReturnHref: (basePath: string) => state.getReturnHref(basePath),
};
