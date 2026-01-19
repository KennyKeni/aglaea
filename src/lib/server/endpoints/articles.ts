import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validate } from '$lib/api/validate';
import { ArticleSchema, ArticleCategorySchema, PaginatedSchema } from '$lib/types/api';
import type { Article, ArticleCategory } from '$lib/types/api';
import { z } from 'zod';

export interface ArticleSearchParams {
	limit?: number;
	offset?: number;
	categorySlugs?: string[];
	includeCategories?: boolean;
	includeImages?: boolean;
}

export interface ArticleDetailParams {
	includeCategories?: boolean;
	includeImages?: boolean;
	includeContent?: boolean;
	includeAuthor?: boolean;
}

function buildSearchQuery(params: ArticleSearchParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.limit) q.set('limit', String(params.limit));
	if (params.offset) q.set('offset', String(params.offset));
	if (params.includeCategories) q.set('includeCategories', 'true');
	if (params.includeImages) q.set('includeImages', 'true');
	params.categorySlugs?.forEach((s) => q.append('categorySlugs', s));
	return q;
}

function buildDetailQuery(params: ArticleDetailParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.includeCategories) q.set('includeCategories', 'true');
	if (params.includeImages) q.set('includeImages', 'true');
	if (params.includeContent) q.set('includeContent', 'true');
	if (params.includeAuthor) q.set('includeAuthor', 'true');
	return q;
}

export type PaginatedArticles = z.infer<ReturnType<typeof PaginatedSchema<typeof ArticleSchema>>>;

export function createArticlesEndpoint(client: ServerClient) {
	return {
		search: async (params: ArticleSearchParams = {}): Promise<ApiResponse<PaginatedArticles>> => {
			const result = await client.get('/articles', buildSearchQuery(params));
			return validate(result, PaginatedSchema(ArticleSchema));
		},

		getById: async (
			id: string | number,
			params: ArticleDetailParams = {},
		): Promise<ApiResponse<Article>> => {
			const result = await client.get(`/articles/${id}`, buildDetailQuery(params));
			return validate(result, ArticleSchema);
		},

		getCategories: async (): Promise<ApiResponse<ArticleCategory[]>> => {
			const result = await client.get('/articles/categories');
			return validate(result, z.array(ArticleCategorySchema));
		},
	};
}
