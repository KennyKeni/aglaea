import { getContext, setContext } from 'svelte';
import type { GridDataState } from '$lib/state/grid-data.svelte';
import type { PanelModeState } from '$lib/state/panel-mode.svelte';
import type { PanelAnimationState } from '$lib/state/panel-animation.svelte';

export interface EntityPanelContext<T> {
  mode: PanelModeState<T>;
  animation: PanelAnimationState;
}

export function createEntityContext<T>(name: string) {
  const DATA_KEY = Symbol(`${name}-data`);
  const PANEL_KEY = Symbol(`${name}-panel`);

  return {
    setDataContext: (state: GridDataState<T>) => setContext(DATA_KEY, state),
    getDataContext: (): GridDataState<T> => getContext(DATA_KEY),
    setPanelContext: (state: EntityPanelContext<T>) => setContext(PANEL_KEY, state),
    getPanelContext: (): EntityPanelContext<T> => getContext(PANEL_KEY),
  };
}
