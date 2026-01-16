<script lang="ts">
	import { untrack } from 'svelte';
	import { PokemonContent } from '$lib/components/pokemon';
	import EntityPanelLayout from '$lib/components/ui/entity-panel-layout.svelte';
	import { createPokemonSpeciesState } from '$lib/state/pokemon-data.svelte';
	import { createPanelMode } from '$lib/state/panel-mode.svelte';
	import { createPanelAnimation } from '$lib/state/panel-animation.svelte';
	import { setPokemonDataContext, setPanelContext } from '$lib/context/pokemon';
	import { formatId } from '$lib/utils/pokemon';
	import type { Pokemon } from '$lib/types/pokemon';

	interface LayoutData {
		totalCount: number;
		pageSize: number;
	}

	let { data, children }: { data: LayoutData; children: any } = $props();

	const pokemonData = untrack(() => createPokemonSpeciesState([], data?.totalCount ?? 0, 1));
	setPokemonDataContext(pokemonData);

	let isMobileState = $state(false);

	const panelMode = createPanelMode<Pokemon>({
		items: () => pokemonData.items,
		basePath: '/pokemon',
		getId: (item) => item.id,
		getFullItemFromPageData: (pageData: Record<string, unknown>) => {
			const dataPokemon = pageData?.pokemon;
			if (dataPokemon && !Array.isArray(dataPokemon) && typeof dataPokemon === 'object' && 'id' in dataPokemon) {
				return dataPokemon as Pokemon;
			}
			return null;
		},
		isMobile: () => isMobileState
	});

	const panelAnimation = createPanelAnimation(
		() => panelMode.mode,
		() => panelMode.isNavigating
	);

	$effect(() => {
		isMobileState = panelAnimation.isMobile;
	});

	setPanelContext({ mode: panelMode, animation: panelAnimation });

	const panelTitle = $derived(panelMode.activeItem ? panelMode.activeItem.name : '');
	const panelSubtitle = $derived(panelMode.activeItem ? formatId(panelMode.activeItem.id) : '');
</script>

<EntityPanelLayout
	{panelMode}
	{panelAnimation}
	title={panelTitle}
	subtitle={panelSubtitle}
	footer="Pokemon data from PokeAPI."
>
	{#snippet children()}
		{@render children()}
	{/snippet}

	{#snippet peekContent()}
		{#if panelMode.activeItem}
			<PokemonContent
				pokemon={panelMode.activeItem}
				mode={panelMode.isNavigating ? 'loading' : 'peek'}
				onExpand={panelMode.expand}
			/>
		{/if}
	{/snippet}
</EntityPanelLayout>
