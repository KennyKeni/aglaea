import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PaginatedSchema, PokemonSchema } from '$lib/types/api';

export const load: PageServerLoad = async ({ fetch, url, parent, isDataRequest }) => {
  const { totalCount, pageSize } = await parent();

  const pageParam = url.searchParams.get('page');
  const requestedPage = parseInt(pageParam ?? '1', 10);

  const typesParam = url.searchParams.get('types');
  const abilitiesParam = url.searchParams.get('abilities');
  const movesParam = url.searchParams.get('moves');
  const generationsParam = url.searchParams.get('generations');

  const statParams = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'totalStats'] as const;

  const totalPages = Math.ceil(totalCount / pageSize);
  const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

  if (requestedPage !== validPage) {
    const params = new URLSearchParams(url.searchParams);
    params.set('page', String(validPage));
    throw redirect(302, `/pokemon?${params.toString()}`);
  }

  const offset = (validPage - 1) * pageSize;

  const apiParams = new URLSearchParams({
    includeTypes: 'true',
    includeAbilities: 'true',
    limit: String(pageSize),
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

  const pokemonPromise = fetch(`${env.BACKEND_URL}/pokemon?${apiParams.toString()}`)
    .then((res) => (res.ok ? res.json() : { data: [] }))
    .then((json) => {
      const parsed = PaginatedSchema(PokemonSchema).safeParse(json);
      return parsed.success ? (parsed.data.data ?? []) : [];
    })
    .catch(() => []);

  return {
    pokemon: isDataRequest ? pokemonPromise : await pokemonPromise,
    currentPage: validPage,
    pageSize,
  };
};
