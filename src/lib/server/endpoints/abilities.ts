import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validateTypeBox } from '$lib/api/validate';
import {
  AbilityListResponseSchema,
  AbilityDetailResponseSchema,
  type AbilityListResponse,
  type AbilityDetailResponse,
} from '@aglaea/contract';

export interface AbilitySearchParams {
  name?: string;
  limit?: number;
  offset?: number;
  flagSlugs?: string[];
}

export interface AbilityDetailParams {
  include?: AbilityInclude[];
}

type AbilityInclude = 'flags' | 'forms';

export function buildSearchQuery(params: AbilitySearchParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.name) q.set('name', params.name);
  if (params.limit) q.set('limit', String(params.limit));
  if (params.offset) q.set('offset', String(params.offset));

  params.flagSlugs?.forEach((s) => q.append('flagSlugs', s));

  return q;
}

function buildDetailQuery(params: AbilityDetailParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.include?.length) q.set('include', params.include.join(','));
  return q;
}

export type Ability = AbilityDetailResponse;
export type PaginatedAbilities = AbilityListResponse;

export function createAbilityEndpoint(client: Pick<ServerClient, 'get'>) {
  return {
    search: async (params: AbilitySearchParams = {}): Promise<ApiResponse<PaginatedAbilities>> => {
      const result = await client.get('/abilities', buildSearchQuery(params));
      return validateTypeBox(result, AbilityListResponseSchema, 'ability list');
    },

    getById: async (
      identifier: string | number,
      params: AbilityDetailParams = {},
    ): Promise<ApiResponse<Ability>> => {
      const result = await client.get(`/abilities/${identifier}`, buildDetailQuery(params));
      return validateTypeBox(result, AbilityDetailResponseSchema, 'ability detail');
    },
  };
}
