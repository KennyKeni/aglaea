import type { Article } from '$lib/types/article';
import { createGridDataState, type GridDataState } from './grid-data-state.svelte';

export function createArticleState(
	initialArticles: Article[],
	totalCount: number,
	currentPage: number
): GridDataState<Article> {
	return createGridDataState<Article>(initialArticles, totalCount, currentPage, {
		apiEndpoint: '/api/articles',
		searchParam: 'title',
		queryParams: {
			includeCategories: true,
			includeImages: true
		}
	});
}
