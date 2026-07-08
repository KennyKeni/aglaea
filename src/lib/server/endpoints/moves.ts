import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validate, validateTypeBox } from '$lib/api/validate';
import { z } from 'zod';
import {
  MoveListResponseSchema,
  MoveDetailResponseSchema,
  type MoveListResponse,
  type MoveDetailResponse,
} from '@aglaea/contract';

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
  include?: MoveInclude[];
}

type MoveInclude = 'flags' | 'boosts' | 'effects' | 'zData' | 'gmaxSpecies' | 'forms';

export function buildSearchQuery(params: MoveSearchParams): URLSearchParams {
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
  if (params.include?.length) q.set('include', params.include.join(','));
  return q;
}

export type Move = MoveDetailResponse;
export type PaginatedMoves = MoveListResponse;
export type FilterOption = z.infer<typeof FilterItemSchema>;

export function createMoveEndpoint(client: Pick<ServerClient, 'get'>) {
  return {
    search: async (params: MoveSearchParams = {}): Promise<ApiResponse<PaginatedMoves>> => {
      const result = await client.get('/moves', buildSearchQuery(params));
      return validateTypeBox(result, MoveListResponseSchema, 'move list');
    },

    getById: async (
      identifier: string | number,
      params: MoveDetailParams = {},
    ): Promise<ApiResponse<Move>> => {
      const result = await client.get(`/moves/${identifier}`, buildDetailQuery(params));
      return validateTypeBox(result, MoveDetailResponseSchema, 'move detail');
    },

    getTypes: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
      const result = await client.get('/types', new URLSearchParams({ limit: String(limit) }));
      return validate(result, FilterDataSchema);
    },

    getCategories: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
      const result = await client.get(
        '/moves/categories',
        new URLSearchParams({ limit: String(limit) }),
      );
      return validate(result, FilterDataSchema);
    },
  };
}
