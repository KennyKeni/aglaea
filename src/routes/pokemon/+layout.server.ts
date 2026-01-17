import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { PaginatedSchema, PokemonSchema } from '$lib/types/api';
import { parseResponse } from '$lib/utils';

const PAGE_SIZE = 24;

export const load: LayoutServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${env.BACKEND_URL}/pokemon?limit=1&offset=0`);

		if (!res.ok) {
			return { totalCount: 0, pageSize: PAGE_SIZE };
		}

		const data = await parseResponse(res, PaginatedSchema(PokemonSchema));

		return {
			totalCount: data.total ?? 0,
			pageSize: PAGE_SIZE
		};
	} catch {
		return { totalCount: 0, pageSize: PAGE_SIZE };
	}
};