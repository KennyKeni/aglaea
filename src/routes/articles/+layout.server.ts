import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import type { Paginated } from '$lib/types/base';
import type { Article } from '$lib/types/article';

const PAGE_SIZE = 12;

export const load: LayoutServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${env.BACKEND_URL}/articles?limit=1&offset=0`);

		if (!res.ok) {
			return { totalCount: 0, pageSize: PAGE_SIZE };
		}

		const response: Paginated<Article> = await res.json();

		return {
			totalCount: response.total ?? 0,
			pageSize: PAGE_SIZE
		};
	} catch {
		return { totalCount: 0, pageSize: PAGE_SIZE };
	}
};
