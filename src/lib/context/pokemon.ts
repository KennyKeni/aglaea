import { getContext, setContext } from 'svelte';
import type { PokemonDataState } from '$lib/hooks/use-pokemon-data.svelte';

const POKEMON_DATA_KEY = Symbol('pokemon-data');

export function setPokemonDataContext(state: PokemonDataState) {
	setContext(POKEMON_DATA_KEY, state);
}

export function getPokemonDataContext(): PokemonDataState {
	return getContext(POKEMON_DATA_KEY);
}
