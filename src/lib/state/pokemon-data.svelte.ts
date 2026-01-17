import type { Pokemon } from '$lib/types/pokemon';
import { createGridDataState, type GridDataState } from './grid-data.svelte';

export function createPokemonSpeciesState(
  initialPokemon: Pokemon[],
  totalCount: number,
  currentPage: number,
): GridDataState<Pokemon> {
  return createGridDataState<Pokemon>(initialPokemon, totalCount, currentPage, {
    apiEndpoint: '/api/pokemon',
    queryParams: {
      includeTypes: true,
      includeAbilities: true,
    },
  });
}
