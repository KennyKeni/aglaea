import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import {
	createMoveEndpoint,
	type Move,
	type FilterOption,
	type MoveSearchParams,
} from '$lib/server/endpoints/moves';

const PAGE_SIZE = 24;

export const load: PageServerLoad = async ({ fetch, url, isDataRequest }) => {
	const client = createServerClient(fetch);
	const moveApi = createMoveEndpoint(client);

	async function fetchMoveList(
		params: MoveSearchParams,
	): Promise<{ moves: Move[]; filteredCount: number }> {
		const result = await moveApi.search(params);
		if (!result.ok) return { moves: [], filteredCount: 0 };
		return { moves: result.data.data ?? [], filteredCount: result.data.total ?? 0 };
	}

	async function fetchTypes(): Promise<FilterOption[]> {
		const result = await moveApi.getTypes();
		if (!result.ok) return [];
		return result.data.data ?? [];
	}

	async function fetchCategories(): Promise<FilterOption[]> {
		const result = await moveApi.getCategories();
		if (!result.ok) return [];
		return result.data.data ?? [];
	}

	const pageParam = url.searchParams.get('page');
	const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10));

	const typesParam = url.searchParams.get('types');
	const categoriesParam = url.searchParams.get('categories');

	const offset = (requestedPage - 1) * PAGE_SIZE;

	const searchTerm = url.searchParams.get('search');

	const searchParams: MoveSearchParams = {
		limit: PAGE_SIZE,
		offset,
		...(searchTerm && { name: searchTerm }),
	};

	if (typesParam) {
		searchParams.typeSlugs = typesParam.split(',').filter(Boolean);
	}
	if (categoriesParam) {
		searchParams.categorySlugs = categoriesParam.split(',').filter(Boolean);
	}

	const movesPromise = fetchMoveList(searchParams);
	const typesPromise = fetchTypes();
	const categoriesPromise = fetchCategories();

	if (isDataRequest) {
		return {
			moves: movesPromise.then((r) => r.moves),
			filteredCount: movesPromise.then((r) => r.filteredCount),
			currentPage: requestedPage,
			pageSize: PAGE_SIZE,
			types: typesPromise,
			categories: categoriesPromise,
		};
	}

	const [movesResult, types, categories] = await Promise.all([
		movesPromise,
		typesPromise,
		categoriesPromise,
	]);

	const totalPages = Math.ceil(movesResult.filteredCount / PAGE_SIZE);
	const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));
	if (requestedPage !== validPage && movesResult.filteredCount > 0) {
		const params = new URLSearchParams(url.searchParams);
		params.set('page', String(validPage));
		throw redirect(302, `/moves?${params.toString()}`);
	}

	return {
		moves: movesResult.moves,
		filteredCount: movesResult.filteredCount,
		currentPage: validPage,
		pageSize: PAGE_SIZE,
		types,
		categories,
	};
};
