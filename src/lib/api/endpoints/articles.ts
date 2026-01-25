import { client } from '../client';
import { validate } from '../validate';
import type { ApiResponse } from '../types';
import type { TiptapDoc } from '$lib/types/article';
import {
	ArticleMutationResponseSchema,
	ArticleDeleteResponseSchema,
	type ArticleMutationResponse,
	type ArticleDeleteResponse,
} from '$lib/types/api';

export interface ArticleInput {
	title: string;
	subtitle?: string | null;
	description?: string | null;
	content?: TiptapDoc | null;
	coverImageId?: string | null;
}

export const articles = {
	create: async (input: ArticleInput): Promise<ApiResponse<ArticleMutationResponse>> => {
		const result = await client.post('/articles', input);
		return validate(result, ArticleMutationResponseSchema);
	},

	update: async (
		id: number | string,
		input: ArticleInput,
	): Promise<ApiResponse<ArticleMutationResponse>> => {
		const result = await client.patch(`/articles/${id}`, input);
		return validate(result, ArticleMutationResponseSchema);
	},

	delete: async (id: number | string): Promise<ApiResponse<ArticleDeleteResponse>> => {
		const result = await client.delete(`/articles/${id}`);
		return validate(result, ArticleDeleteResponseSchema);
	},
};
