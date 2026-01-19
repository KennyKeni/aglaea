import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PaginatedSchema, PokemonSchema, NamedRefSchema } from '$lib/types/api';
import { parseResponse } from '$lib/server/api';
import { z } from 'zod';

const PAGE_SIZE = 24;

const AbilitySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  desc: z.string().nullable(),
  shortDesc: z.string().nullable(),
  flags: z.array(z.unknown()),
});

const MoveSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  desc: z.string().nullable(),
  shortDesc: z.string().nullable(),
  type: NamedRefSchema,
  category: z.object({ id: z.number(), slug: z.string(), name: z.string() }),
  target: z.unknown().nullable(),
  power: z.number().nullable(),
  accuracy: z.number().nullable(),
  pp: z.number(),
  priority: z.number(),
  critRatio: z.number().nullable(),
  minHits: z.number().nullable(),
  maxHits: z.number().nullable(),
  drainPercent: z.number().nullable(),
  healPercent: z.number().nullable(),
  recoilPercent: z.number().nullable(),
  flags: z.array(z.unknown()),
  boosts: z.array(z.unknown()),
  effects: z.array(z.unknown()),
  maxPower: z.number().nullable(),
  zData: z.unknown().nullable(),
  gmaxSpecies: z.array(z.unknown()),
});

type FilterOption = { id: number; slug: string; name: string };

async function fetchPokemonList(
  fetch: typeof globalThis.fetch,
  apiParams: URLSearchParams
): Promise<{ pokemon: z.infer<typeof PokemonSchema>[]; filteredCount: number }> {
  const res = await fetch(`${env.BACKEND_URL}/pokemon?${apiParams.toString()}`).catch(() => null);
  if (!res?.ok) return { pokemon: [], filteredCount: 0 };
  try {
    const data = await parseResponse(res, PaginatedSchema(PokemonSchema));
    return { pokemon: data.data ?? [], filteredCount: data.total ?? 0 };
  } catch {
    return { pokemon: [], filteredCount: 0 };
  }
}

async function fetchTypes(fetch: typeof globalThis.fetch): Promise<FilterOption[]> {
  const res = await fetch(`${env.BACKEND_URL}/types?limit=9999`).catch(() => null);
  if (!res?.ok) return [];
  try {
    const data = await parseResponse(res, PaginatedSchema(NamedRefSchema));
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function fetchAbilities(fetch: typeof globalThis.fetch): Promise<FilterOption[]> {
  const res = await fetch(`${env.BACKEND_URL}/abilities?limit=9999`).catch(() => null);
  if (!res?.ok) return [];
  try {
    const data = await parseResponse(res, PaginatedSchema(AbilitySchema));
    return (data.data ?? []).map((a) => ({ id: a.id, slug: a.slug, name: a.name }));
  } catch {
    return [];
  }
}

async function fetchMoves(fetch: typeof globalThis.fetch): Promise<FilterOption[]> {
  const res = await fetch(`${env.BACKEND_URL}/moves?limit=9999`).catch(() => null);
  if (!res?.ok) return [];
  try {
    const data = await parseResponse(res, PaginatedSchema(MoveSchema));
    return (data.data ?? []).map((m) => ({ id: m.id, slug: m.slug, name: m.name }));
  } catch {
    return [];
  }
}

export const load: PageServerLoad = async ({ fetch, url, isDataRequest }) => {
  const pageParam = url.searchParams.get('page');
  const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10));

  const typesParam = url.searchParams.get('types');
  const abilitiesParam = url.searchParams.get('abilities');
  const movesParam = url.searchParams.get('moves');
  const generationsParam = url.searchParams.get('generations');

  const statParams = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'totalStats'] as const;

  const offset = (requestedPage - 1) * PAGE_SIZE;

  const apiParams = new URLSearchParams({
    includeTypes: 'true',
    includeAbilities: 'true',
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });

  if (typesParam) {
    typesParam.split(',').filter(Boolean).forEach((slug) => apiParams.append('typeSlugs', slug));
  }
  if (abilitiesParam) {
    abilitiesParam.split(',').filter(Boolean).forEach((slug) => apiParams.append('abilitySlugs', slug));
  }
  if (movesParam) {
    movesParam.split(',').filter(Boolean).forEach((slug) => apiParams.append('moveSlugs', slug));
  }
  if (generationsParam) {
    generationsParam.split(',').filter(Boolean).forEach((gen) => apiParams.append('generations', gen));
  }

  for (const stat of statParams) {
    const minParam = url.searchParams.get(`${stat}Min`);
    const maxParam = url.searchParams.get(`${stat}Max`);
    if (minParam) apiParams.append(`${stat}Min`, minParam);
    if (maxParam) apiParams.append(`${stat}Max`, maxParam);
  }

  const pokemonPromise = fetchPokemonList(fetch, apiParams);
  const typesPromise = fetchTypes(fetch);
  const abilitiesPromise = fetchAbilities(fetch);
  const movesPromise = fetchMoves(fetch);

  // Client navigation: return promises directly for streaming
  if (isDataRequest) {
    return {
      pokemon: pokemonPromise.then((r) => r.pokemon),
      filteredCount: pokemonPromise.then((r) => r.filteredCount),
      currentPage: requestedPage,
      pageSize: PAGE_SIZE,
      types: typesPromise,
      abilities: abilitiesPromise,
      moves: movesPromise,
    };
  }

  // SSR: await everything for full HTML
  const [pokemonResult, types, abilities, moves] = await Promise.all([
    pokemonPromise,
    typesPromise,
    abilitiesPromise,
    movesPromise,
  ]);

  // Page validation only on SSR
  const totalPages = Math.ceil(pokemonResult.filteredCount / PAGE_SIZE);
  const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));
  if (requestedPage !== validPage && pokemonResult.filteredCount > 0) {
    const params = new URLSearchParams(url.searchParams);
    params.set('page', String(validPage));
    throw redirect(302, `/pokemon?${params.toString()}`);
  }

  return {
    pokemon: pokemonResult.pokemon,
    filteredCount: pokemonResult.filteredCount,
    currentPage: validPage,
    pageSize: PAGE_SIZE,
    types,
    abilities,
    moves,
  };
};
