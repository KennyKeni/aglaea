import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validate } from '$lib/api/validate';
import { MoveSchema, PaginatedSchema, NamedRefSchema } from '$lib/types/api';
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

export interface MoveSearchParams {
	name?: string;
	limit?: number;
	offset?: number;
	typeSlugs?: string[];
	categorySlugs?: string[];
	flagSlugs?: string[];
}

export interface MoveDetailParams {
	includeFlags?: boolean;
	includeBoosts?: boolean;
	includeEffects?: boolean;
	includeZData?: boolean;
	includeGmaxSpecies?: boolean;
	includeForms?: boolean;
}

function buildSearchQuery(params: MoveSearchParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.name) q.set('name', params.name);
	if (params.limit) q.set('limit', String(params.limit));
	if (params.offset) q.set('offset', String(params.offset));

	params.typeSlugs?.forEach((s) => q.append('typeSlugs', s));
	params.categorySlugs?.forEach((s) => q.append('categorySlugs', s));
	params.flagSlugs?.forEach((s) => q.append('flagSlugs', s));

	return q;
}

function buildDetailQuery(params: MoveDetailParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.includeFlags) q.set('includeFlags', 'true');
	if (params.includeBoosts) q.set('includeBoosts', 'true');
	if (params.includeEffects) q.set('includeEffects', 'true');
	if (params.includeZData) q.set('includeZData', 'true');
	if (params.includeGmaxSpecies) q.set('includeGmaxSpecies', 'true');
	if (params.includeForms) q.set('includeForms', 'true');
	return q;
}

export type Move = z.infer<typeof MoveSchema>;
export type PaginatedMoves = z.infer<ReturnType<typeof PaginatedSchema<typeof MoveSchema>>>;
export type FilterOption = z.infer<typeof NamedRefSchema>;

export function createMoveEndpoint(client: ServerClient) {
	return {
		search: async (params: MoveSearchParams = {}): Promise<ApiResponse<PaginatedMoves>> => {
			const result = await client.get('/moves', buildSearchQuery(params));
			return validate(result, PaginatedSchema(MoveSchema));
		},

		getById: async (
			identifier: string | number,
			params: MoveDetailParams = {},
		): Promise<ApiResponse<Move>> => {
			const result = await client.get(`/moves/${identifier}`, buildDetailQuery(params));
			return validate(result, MoveSchema);
		},

		getTypes: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
			const result = await client.get('/types', new URLSearchParams({ limit: String(limit) }));
			return validate(result, FilterDataSchema);
		},

		getCategories: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
			const result = await client.get(
				'/move-categories',
				new URLSearchParams({ limit: String(limit) }),
			);
			return validate(result, FilterDataSchema);
		},
	};
}
