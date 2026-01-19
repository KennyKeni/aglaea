import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import {
  createPokemonEndpoint,
  type Pokemon,
  type FilterOption,
  type PokemonSearchParams,
} from '$lib/server/endpoints/pokemon';

const PAGE_SIZE = 24;

export const load: PageServerLoad = async ({ fetch, url, isDataRequest }) => {
  const client = createServerClient(fetch);
  const pokemonApi = createPokemonEndpoint(client);

  async function fetchPokemonList(
    params: PokemonSearchParams,
  ): Promise<{ pokemon: Pokemon[]; filteredCount: number }> {
    const result = await pokemonApi.search(params);
    if (!result.ok) return { pokemon: [], filteredCount: 0 };
    return { pokemon: result.data.data ?? [], filteredCount: result.data.total ?? 0 };
  }

  async function fetchTypes(): Promise<FilterOption[]> {
    const result = await pokemonApi.getTypes();
    if (!result.ok) return [];
    return result.data.data ?? [];
  }

  async function fetchAbilities(): Promise<FilterOption[]> {
    const result = await pokemonApi.getAbilities();
    if (!result.ok) return [];
    return result.data.data ?? [];
  }

  async function fetchMoves(): Promise<FilterOption[]> {
    const result = await pokemonApi.getMoves();
    if (!result.ok) return [];
    return result.data.data ?? [];
  }

  const pageParam = url.searchParams.get('page');
  const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10));

  const typesParam = url.searchParams.get('types');
  const abilitiesParam = url.searchParams.get('abilities');
  const movesParam = url.searchParams.get('moves');
  const generationsParam = url.searchParams.get('generations');

  const statParams = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'totalStats'] as const;

  const offset = (requestedPage - 1) * PAGE_SIZE;

  const searchParams: PokemonSearchParams = {
    includeTypes: true,
    includeAbilities: true,
    limit: PAGE_SIZE,
    offset,
  };

  if (typesParam) {
    searchParams.typeSlugs = typesParam.split(',').filter(Boolean);
  }
  if (abilitiesParam) {
    searchParams.abilitySlugs = abilitiesParam.split(',').filter(Boolean);
  }
  if (movesParam) {
    searchParams.moveSlugs = movesParam.split(',').filter(Boolean);
  }
  if (generationsParam) {
    searchParams.generations = generationsParam.split(',').filter(Boolean);
  }

  for (const stat of statParams) {
    const minParam = url.searchParams.get(`${stat}Min`);
    const maxParam = url.searchParams.get(`${stat}Max`);
    if (minParam) {
      (searchParams as Record<string, unknown>)[`${stat}Min`] = parseInt(minParam, 10);
    }
    if (maxParam) {
      (searchParams as Record<string, unknown>)[`${stat}Max`] = parseInt(maxParam, 10);
    }
  }

  const pokemonPromise = fetchPokemonList(searchParams);
  const typesPromise = fetchTypes();
  const abilitiesPromise = fetchAbilities();
  const movesPromise = fetchMoves();

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
