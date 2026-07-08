import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validate, validateTypeBox } from '$lib/api/validate';
import { z } from 'zod';
import {
  ItemListResponseSchema,
  ItemDetailResponseSchema,
  type ItemListResponse,
  type ItemDetailResponse,
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
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export interface ItemSearchParams {
  name?: string;
  limit?: number;
  offset?: number;
  tagSlugs?: string[];
}

export interface ItemDetailParams {
  include?: ItemInclude[];
}

type ItemInclude = 'boosts' | 'flags' | 'tags' | 'recipes';

export function buildSearchQuery(params: ItemSearchParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.name) q.set('name', params.name);
  if (params.limit) q.set('limit', String(params.limit));
  if (params.offset) q.set('offset', String(params.offset));

  params.tagSlugs?.forEach((s) => q.append('tagSlugs', s));

  return q;
}

function buildDetailQuery(params: ItemDetailParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.include?.length) q.set('include', params.include.join(','));
  return q;
}

export type Item = ItemDetailResponse;
export type PaginatedItems = ItemListResponse;
export type FilterOption = z.infer<typeof FilterItemSchema>;

export function createItemEndpoint(client: Pick<ServerClient, 'get'>) {
  return {
    search: async (params: ItemSearchParams = {}): Promise<ApiResponse<PaginatedItems>> => {
      const result = await client.get('/items', buildSearchQuery(params));
      return validateTypeBox(result, ItemListResponseSchema, 'item list');
    },

    getById: async (
      identifier: string | number,
      params: ItemDetailParams = {},
    ): Promise<ApiResponse<Item>> => {
      const result = await client.get(`/items/${identifier}`, buildDetailQuery(params));
      return validateTypeBox(result, ItemDetailResponseSchema, 'item detail');
    },

    getTags: async (
      limit = 9999,
    ): Promise<
      ApiResponse<{ data: FilterOption[]; total: number; limit: number; offset: number }>
    > => {
      const result = await client.get('/items/tags', new URLSearchParams({ limit: String(limit) }));
      return validate(result, FilterDataSchema);
    },
  };
}
