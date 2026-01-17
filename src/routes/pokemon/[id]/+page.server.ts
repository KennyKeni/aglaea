import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import { PokemonSchema } from '$lib/types/api';
import { parseResponse } from '$lib/utils';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
  const res = await fetch(
    `${env.BACKEND_URL}/pokemon/${params.id}?includeTypes=true&includeAbilities=true&includeMoves=true&includeSpawns=true&includeDrops=true&includeLabels=true&includeEggGroups=true&includeExperienceGroup=true`,
  );

  if (!res.ok) {
    error(404, 'Pokemon not found');
  }

  setHeaders({
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  });

  const pokemon = await parseResponse(res, PokemonSchema);

  return { pokemon };
};
