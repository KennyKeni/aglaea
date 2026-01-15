import { getContext, setContext } from 'svelte';
import type { GridDataState } from '$lib/state/grid-data.svelte';
import type { PanelModeState } from '$lib/state/panel-mode.svelte';
import type { PanelAnimationState } from '$lib/state/panel-animation.svelte';
import type { Pokemon } from '$lib/types/pokemon';

const POKEMON_DATA_KEY = Symbol('pokemon-data');
const PANEL_KEY = Symbol('panel');

export function setPokemonDataContext(state: GridDataState<Pokemon>) {
	setContext(POKEMON_DATA_KEY, state);
}

export function getPokemonDataContext(): GridDataState<Pokemon> {
	return getContext(POKEMON_DATA_KEY);
}

export interface PanelContext {
	mode: PanelModeState<Pokemon>;
	animation: PanelAnimationState;
}

export function setPanelContext(state: PanelContext) {
	setContext(PANEL_KEY, state);
}

export function getPanelContext(): PanelContext {
	return getContext(PANEL_KEY);
}
