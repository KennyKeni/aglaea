import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import {
	createAbilityEndpoint,
	type Ability,
	type AbilitySearchParams,
} from '$lib/server/endpoints/abilities';

const PAGE_SIZE = 24;

export const load: PageServerLoad = async ({ fetch, url, isDataRequest }) => {
	const client = createServerClient(fetch);
	const abilityApi = createAbilityEndpoint(client);

	async function fetchAbilityList(
		params: AbilitySearchParams,
	): Promise<{ abilities: Ability[]; filteredCount: number }> {
		const result = await abilityApi.search(params);
		if (!result.ok) return { abilities: [], filteredCount: 0 };
		return { abilities: result.data.data ?? [], filteredCount: result.data.total ?? 0 };
	}

	const pageParam = url.searchParams.get('page');
	const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10));

	const offset = (requestedPage - 1) * PAGE_SIZE;

	const searchTerm = url.searchParams.get('search');

	const searchParams: AbilitySearchParams = {
		limit: PAGE_SIZE,
		offset,
		...(searchTerm && { name: searchTerm }),
	};

	const abilitiesPromise = fetchAbilityList(searchParams);

	if (isDataRequest) {
		return {
			abilities: abilitiesPromise.then((r) => r.abilities),
			filteredCount: abilitiesPromise.then((r) => r.filteredCount),
			currentPage: requestedPage,
			pageSize: PAGE_SIZE,
		};
	}

	const abilitiesResult = await abilitiesPromise;

	const totalPages = Math.ceil(abilitiesResult.filteredCount / PAGE_SIZE);
	const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));
	if (requestedPage !== validPage && abilitiesResult.filteredCount > 0) {
		const params = new URLSearchParams(url.searchParams);
		params.set('page', String(validPage));
		throw redirect(302, `/abilities?${params.toString()}`);
	}

	return {
		abilities: abilitiesResult.abilities,
		filteredCount: abilitiesResult.filteredCount,
		currentPage: validPage,
		pageSize: PAGE_SIZE,
	};
};
