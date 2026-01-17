import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ArticleSchema, PaginatedSchema } from '$lib/types/api';

const PAGE_SIZE = 12;

export const load: LayoutServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${env.BACKEND_URL}/articles?limit=1&offset=0`);

		if (!res.ok) {
			return { totalCount: 0, pageSize: PAGE_SIZE };
		}

		const json = await res.json();
		const parsed = PaginatedSchema(ArticleSchema).safeParse(json);
		if (!parsed.success) {
			throw error(500, 'Invalid API response');
		}

		return {
			totalCount: parsed.data.total ?? 0,
			pageSize: PAGE_SIZE
		};
	} catch {
		return { totalCount: 0, pageSize: PAGE_SIZE };
	}
};
