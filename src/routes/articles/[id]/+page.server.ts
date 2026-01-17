import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ArticleSchema } from '$lib/types/api';
import { jsonToHtml } from '$lib/server/tiptap';
import { extractToc } from '$lib/utils/toc';

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
	try {
		const res = await fetch(
			`${env.BACKEND_URL}/articles/${params.id}?includeCategories=true&includeImages=true&includeBody=true`
		);

		if (!res.ok) {
			throw error(404, 'Article not found');
		}

		setHeaders({
			'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
		});

		const json = await res.json();
		const parsed = ArticleSchema.safeParse(json);
		if (!parsed.success) {
			throw error(500, 'Invalid API response');
		}
		const article = parsed.data;
		const doc = JSON.parse(article.body);
		const bodyToc = extractToc(doc);
		const toc = [{ id: 'article-title', text: article.title, level: 0 }, ...bodyToc];
		const bodyHtml = jsonToHtml(article.body);

		return { article: { ...article, bodyHtml }, toc, panel: true };
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		throw error(500, 'Failed to load article');
	}
};
