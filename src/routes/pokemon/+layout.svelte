<script lang="ts">
	import { untrack } from 'svelte';
	import { Panel, PokemonContent } from '$lib/components/pokemon';
	import { createPokemonSpeciesState } from '$lib/states/pokemon-species-state.svelte';
	import { usePanelMode } from '$lib/hooks/use-panel-mode.svelte';
	import { usePanelAnimation } from '$lib/hooks/use-panel-animation.svelte';
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

	const panelMode = usePanelMode<Pokemon>({
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

	const panelAnimation = usePanelAnimation(
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

<div class="bg-muted/30 flex min-h-full flex-col">
	<div class:hidden={panelMode.isDetailRoute}>
		{@render children()}
	</div>

	<Panel
		itemKey={panelMode.activeId}
		title={panelTitle}
		subtitle={panelSubtitle}
		animation={panelAnimation}
		onClose={panelMode.close}
		onExpand={panelMode.expand}
		onCollapse={panelMode.collapse}
		mode={panelMode.mode}
	>
		{#if panelMode.isDetailRoute}
			{@render children()}
		{:else if panelMode.activeItem}
			<PokemonContent
				pokemon={panelMode.activeItem}
				mode={panelMode.isNavigating ? 'loading' : 'peek'}
				onExpand={panelMode.expand}
			/>
		{/if}
	</Panel>

	<div class="bg-background border-t">
		<div class="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-xs">
			Peek panel - expand into full-width detail.
		</div>
	</div>
</div>
