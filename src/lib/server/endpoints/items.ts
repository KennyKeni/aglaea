import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validate } from '$lib/api/validate';
import { ItemSchema, PaginatedSchema, NamedRefSchema } from '$lib/types/api';
import { z } from 'zod';

const FilterItemSchema = z
	.object({
		id: z.number(),
		slug: z.string(),
		name: z.string(),
	})
	.catchall(z.unknown());

const FilterDataSchema = z.object({
	data: z.array(FilterItemSchema),
});

export interface ItemSearchParams {
	name?: string;
	limit?: number;
	offset?: number;
	tagSlugs?: string[];
}

export interface ItemDetailParams {
	includeBoosts?: boolean;
	includeFlags?: boolean;
	includeTags?: boolean;
	includeRecipes?: boolean;
}

function buildSearchQuery(params: ItemSearchParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.name) q.set('name', params.name);
	if (params.limit) q.set('limit', String(params.limit));
	if (params.offset) q.set('offset', String(params.offset));

	params.tagSlugs?.forEach((s) => q.append('tagSlugs', s));

	return q;
}

function buildDetailQuery(params: ItemDetailParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.includeBoosts) q.set('includeBoosts', 'true');
	if (params.includeFlags) q.set('includeFlags', 'true');
	if (params.includeTags) q.set('includeTags', 'true');
	if (params.includeRecipes) q.set('includeRecipes', 'true');
	return q;
}

export type Item = z.infer<typeof ItemSchema>;
export type PaginatedItems = z.infer<ReturnType<typeof PaginatedSchema<typeof ItemSchema>>>;
export type FilterOption = z.infer<typeof NamedRefSchema>;

export function createItemEndpoint(client: ServerClient) {
	return {
		search: async (params: ItemSearchParams = {}): Promise<ApiResponse<PaginatedItems>> => {
			const result = await client.get('/items', buildSearchQuery(params));
			return validate(result, PaginatedSchema(ItemSchema));
		},

		getById: async (
			identifier: string | number,
			params: ItemDetailParams = {},
		): Promise<ApiResponse<Item>> => {
			const result = await client.get(`/items/${identifier}`, buildDetailQuery(params));
			return validate(result, ItemSchema);
		},

		getTags: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
			const result = await client.get(
				'/item-tags',
				new URLSearchParams({ limit: String(limit) }),
			);
			return validate(result, FilterDataSchema);
		},
	};
}
