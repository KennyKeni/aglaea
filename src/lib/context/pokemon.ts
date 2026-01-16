import type { Pokemon } from '$lib/types/pokemon';
import { createEntityContext, type EntityPanelContext } from './entity';

const ctx = createEntityContext<Pokemon>('pokemon');

export const setPokemonDataContext = ctx.setDataContext;
export const getPokemonDataContext = ctx.getDataContext;
export const setPanelContext = ctx.setPanelContext;
export const getPanelContext = ctx.getPanelContext;

export type PanelContext = EntityPanelContext<Pokemon>;
