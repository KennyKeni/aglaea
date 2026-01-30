import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validate } from '$lib/api/validate';
import { AbilitySchema, PaginatedSchema } from '$lib/types/api';
import { z } from 'zod';

export interface AbilitySearchParams {
	name?: string;
	limit?: number;
	offset?: number;
	flagSlugs?: string[];
}

export interface AbilityDetailParams {
	includeFlags?: boolean;
}

function buildSearchQuery(params: AbilitySearchParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.name) q.set('name', params.name);
	if (params.limit) q.set('limit', String(params.limit));
	if (params.offset) q.set('offset', String(params.offset));

	params.flagSlugs?.forEach((s) => q.append('flagSlugs', s));

	return q;
}

function buildDetailQuery(params: AbilityDetailParams): URLSearchParams {
	const q = new URLSearchParams();
	if (params.includeFlags) q.set('includeFlags', 'true');
	return q;
}

export type Ability = z.infer<typeof AbilitySchema>;
export type PaginatedAbilities = z.infer<
	ReturnType<typeof PaginatedSchema<typeof AbilitySchema>>
>;

export function createAbilityEndpoint(client: ServerClient) {
	return {
		search: async (
			params: AbilitySearchParams = {},
		): Promise<ApiResponse<PaginatedAbilities>> => {
			const result = await client.get('/abilities', buildSearchQuery(params));
			return validate(result, PaginatedSchema(AbilitySchema));
		},

		getById: async (
			identifier: string | number,
			params: AbilityDetailParams = {},
		): Promise<ApiResponse<Ability>> => {
			const result = await client.get(`/abilities/${identifier}`, buildDetailQuery(params));
			return validate(result, AbilitySchema);
		},
	};
}
