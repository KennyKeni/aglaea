import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import type { Paginated } from '$lib/types/base';
import type { Pokemon } from '$lib/types/pokemon';

const PAGE_SIZE = 24;

export const load: LayoutServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${env.BACKEND_URL}/pokemon?limit=1&offset=0`);

		if (!res.ok) {
			return { totalCount: 0, pageSize: PAGE_SIZE };
		}

		const response: Paginated<Pokemon> = await res.json();

		return {
			totalCount: response.total ?? 0,
			pageSize: PAGE_SIZE
		};
	} catch {
		return { totalCount: 0, pageSize: PAGE_SIZE };
	}
};