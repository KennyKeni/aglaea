import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createPokemonEndpoint } from '$lib/server/endpoints/pokemon';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
  const client = createServerClient(fetch);
  const pokemonApi = createPokemonEndpoint(client);

  const result = await pokemonApi.getById(params.id, {
    include: [
      'forms',
      'types',
      'abilities',
      'moves',
      'spawns',
      'drops',
      'labels',
      'aspects',
      'eggGroups',
      'experienceGroup',
      'hitboxes',
      'lighting',
      'riding',
      'behaviour',
    ],
  });

  if (!result.ok) {
    if (result.status === 404) {
      error(404, 'Pokemon not found');
    }
    error(result.status, result.message);
  }

  setHeaders({
    'Cache-Control': 'public, max-age=0, must-revalidate',
  });

  return { pokemon: result.data };
};
