import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ArticleSchema } from '$lib/types/api';
import { parseResponse } from '$lib/utils';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(
		`${env.BACKEND_URL}/articles/${params.id}?includeCategories=true&includeImages=true&includeBody=true`
	);

	if (!res.ok) {
		throw error(404, 'Article not found');
	}

	const article = await parseResponse(res, ArticleSchema);
	return { article, panel: true };
};
