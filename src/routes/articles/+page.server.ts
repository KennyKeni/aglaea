import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ArticleSchema, PaginatedSchema } from '$lib/types/api';
import { parseResponse } from '$lib/utils';

export const load: PageServerLoad = async ({ fetch, url, parent }) => {
	const { totalCount, pageSize } = await parent();

	const pageParam = url.searchParams.get('page');
	const requestedPage = parseInt(pageParam ?? '1', 10);

	const totalPages = Math.ceil(totalCount / pageSize);
	const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

	if (requestedPage !== validPage) {
		throw redirect(302, `/articles?page=${validPage}`);
	}

	const offset = (validPage - 1) * pageSize;

	try {
		const res = await fetch(
			`${env.BACKEND_URL}/articles?includeCategories=true&includeImages=true&limit=${pageSize}&offset=${offset}`
		);

		if (!res.ok) {
			return { articles: [], currentPage: validPage, pageSize };
		}

		const data = await parseResponse(res, PaginatedSchema(ArticleSchema));

		return {
			articles: data.data ?? [],
			currentPage: validPage,
			pageSize
		};
	} catch {
		return { articles: [], currentPage: validPage, pageSize };
	}
};
