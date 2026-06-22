import type { ServerClient } from '../client';
import type { ApiResponse } from '$lib/api/types';
import { validate } from '$lib/api/validate';
import { PokemonSchema, PaginatedSchema, NamedRefSchema } from '$lib/types/api';
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

export interface PokemonSearchParams {
  name?: string;
  limit?: number;
  offset?: number;
  typeSlugs?: string[];
  abilitySlugs?: string[];
  moveSlugs?: string[];
  generations?: string[];
  include?: PokemonInclude[];
  hpMin?: number;
  hpMax?: number;
  attackMin?: number;
  attackMax?: number;
  defenseMin?: number;
  defenseMax?: number;
  specialAttackMin?: number;
  specialAttackMax?: number;
  specialDefenseMin?: number;
  specialDefenseMax?: number;
  speedMin?: number;
  speedMax?: number;
  totalStatsMin?: number;
  totalStatsMax?: number;
}

export interface PokemonDetailParams {
  include?: PokemonInclude[];
}

type PokemonInclude =
  | 'forms'
  | 'types'
  | 'abilities'
  | 'moves'
  | 'spawns'
  | 'drops'
  | 'labels'
  | 'eggGroups'
  | 'experienceGroup';

function setInclude(q: URLSearchParams, values: PokemonInclude[] | undefined): void {
  if (values?.length) q.set('include', values.join(','));
}

function buildSearchQuery(params: PokemonSearchParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.name) q.set('name', params.name);
  if (params.limit) q.set('limit', String(params.limit));
  if (params.offset) q.set('offset', String(params.offset));
  setInclude(q, params.include);

  params.typeSlugs?.forEach((s) => q.append('hasForm.typeSlugs', s));
  params.abilitySlugs?.forEach((s) => q.append('hasForm.abilitySlugs', s));
  params.moveSlugs?.forEach((s) => q.append('hasForm.moveSlugs', s));
  params.generations?.forEach((g) => q.append('generations', g));

  const statParams = [
    ['hpMin', params.hpMin],
    ['hpMax', params.hpMax],
    ['attackMin', params.attackMin],
    ['attackMax', params.attackMax],
    ['defenseMin', params.defenseMin],
    ['defenseMax', params.defenseMax],
    ['specialAttackMin', params.specialAttackMin],
    ['specialAttackMax', params.specialAttackMax],
    ['specialDefenseMin', params.specialDefenseMin],
    ['specialDefenseMax', params.specialDefenseMax],
    ['speedMin', params.speedMin],
    ['speedMax', params.speedMax],
    ['totalStatsMin', params.totalStatsMin],
    ['totalStatsMax', params.totalStatsMax],
  ] as const;

  for (const [key, value] of statParams) {
    if (value !== undefined) q.set(key, String(value));
  }

  return q;
}

function buildDetailQuery(params: PokemonDetailParams): URLSearchParams {
  const q = new URLSearchParams();
  setInclude(q, params.include);
  return q;
}

export type Pokemon = z.infer<typeof PokemonSchema>;
export type PaginatedPokemon = z.infer<ReturnType<typeof PaginatedSchema<typeof PokemonSchema>>>;
export type FilterOption = z.infer<typeof NamedRefSchema>;

export function createPokemonEndpoint(client: ServerClient) {
  return {
    search: async (params: PokemonSearchParams = {}): Promise<ApiResponse<PaginatedPokemon>> => {
      const result = await client.get('/pokemon/species', buildSearchQuery(params));
      return validate(result, PaginatedSchema(PokemonSchema));
    },

    getById: async (
      id: string | number,
      params: PokemonDetailParams = {},
    ): Promise<ApiResponse<Pokemon>> => {
      const result = await client.get(`/pokemon/species/${id}`, buildDetailQuery(params));
      return validate(result, PokemonSchema);
    },

    getTypes: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
      const result = await client.get('/types', new URLSearchParams({ limit: String(limit) }));
      return validate(result, FilterDataSchema);
    },

    getAbilities: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
      const result = await client.get('/abilities', new URLSearchParams({ limit: String(limit) }));
      return validate(result, FilterDataSchema);
    },

    getMoves: async (limit = 9999): Promise<ApiResponse<{ data: FilterOption[] }>> => {
      const result = await client.get('/moves', new URLSearchParams({ limit: String(limit) }));
      return validate(result, FilterDataSchema);
    },
  };
}
