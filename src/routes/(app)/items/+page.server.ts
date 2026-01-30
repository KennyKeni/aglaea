import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import {
	createItemEndpoint,
	type Item,
	type FilterOption,
	type ItemSearchParams,
} from '$lib/server/endpoints/items';

const PAGE_SIZE = 24;

export const load: PageServerLoad = async ({ fetch, url, isDataRequest }) => {
	const client = createServerClient(fetch);
	const itemApi = createItemEndpoint(client);

	async function fetchItemList(
		params: ItemSearchParams,
	): Promise<{ items: Item[]; filteredCount: number }> {
		const result = await itemApi.search(params);
		if (!result.ok) return { items: [], filteredCount: 0 };
		return { items: result.data.data ?? [], filteredCount: result.data.total ?? 0 };
	}

	async function fetchTags(): Promise<FilterOption[]> {
		const result = await itemApi.getTags();
		if (!result.ok) return [];
		return result.data.data ?? [];
	}

	const pageParam = url.searchParams.get('page');
	const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10));

	const tagsParam = url.searchParams.get('tags');

	const offset = (requestedPage - 1) * PAGE_SIZE;

	const searchTerm = url.searchParams.get('search');

	const searchParams: ItemSearchParams = {
		limit: PAGE_SIZE,
		offset,
		...(searchTerm && { name: searchTerm }),
	};

	if (tagsParam) {
		searchParams.tagSlugs = tagsParam.split(',').filter(Boolean);
	}

	const itemsPromise = fetchItemList(searchParams);
	const tagsPromise = fetchTags();

	if (isDataRequest) {
		return {
			items: itemsPromise.then((r) => r.items),
			filteredCount: itemsPromise.then((r) => r.filteredCount),
			currentPage: requestedPage,
			pageSize: PAGE_SIZE,
			tags: tagsPromise,
		};
	}

	const [itemsResult, tags] = await Promise.all([itemsPromise, tagsPromise]);

	const totalPages = Math.ceil(itemsResult.filteredCount / PAGE_SIZE);
	const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));
	if (requestedPage !== validPage && itemsResult.filteredCount > 0) {
		const params = new URLSearchParams(url.searchParams);
		params.set('page', String(validPage));
		throw redirect(302, `/items?${params.toString()}`);
	}

	return {
		items: itemsResult.items,
		filteredCount: itemsResult.filteredCount,
		currentPage: validPage,
		pageSize: PAGE_SIZE,
		tags,
	};
};
