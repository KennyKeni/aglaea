import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PaginatedSchema, PokemonSchema } from '$lib/types/api';

export const load: PageServerLoad = async ({ fetch, url, parent }) => {
	const { totalCount, pageSize } = await parent();

	const pageParam = url.searchParams.get('page');
	const requestedPage = parseInt(pageParam ?? '1', 10);

	const totalPages = Math.ceil(totalCount / pageSize);
	const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

	if (requestedPage !== validPage) {
		throw redirect(302, `/pokemon?page=${validPage}`);
	}

	const offset = (validPage - 1) * pageSize;

	try {
		const res = await fetch(
			`${env.BACKEND_URL}/pokemon?includeTypes=true&includeAbilities=true&limit=${pageSize}&offset=${offset}`
		);

		if (!res.ok) {
			return { pokemon: [], currentPage: validPage, pageSize };
		}

		const json = await res.json();
		const parsed = PaginatedSchema(PokemonSchema).safeParse(json);
		if (!parsed.success) {
			throw error(500, 'Invalid API response');
		}

		return {
			pokemon: parsed.data.data ?? [],
			currentPage: validPage,
			pageSize
		};
	} catch {
		return { pokemon: [], currentPage: validPage, pageSize };
	}
};
