import type { Ability } from '$lib/types/ability';
import { GridDataStateImpl } from './grid-data.svelte';

const state = new GridDataStateImpl<Ability>([], 0, 1, {
	apiEndpoint: '/api/abilities',
	queryParams: {},
});

export const abilityStore = {
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
	setItems: (items: Ability[]) => state.setItems(items),
	setListParams: (params: URLSearchParams) => state.setListParams(params),
	getReturnHref: (basePath: string) => state.getReturnHref(basePath),
};
