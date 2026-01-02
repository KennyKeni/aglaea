<script lang="ts">
	import { onMount } from 'svelte';
	import {
		SearchHeader,
		PokemonCard,
		PokemonPanel,
		PokemonDetail,
		PokemonMoves,
		PokemonDetailsTab
	} from '$lib/components/pokemon';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn } from '$lib/utils';
	import { usePanelState } from '$lib/hooks/use-panel-state.svelte';
	import { usePokemonData } from '$lib/hooks/use-pokemon-data.svelte';
	import { setPokemonDataContext } from '$lib/context/pokemon';
	import type { Pokemon } from './types';

	interface LayoutData {
		pokemon: Pokemon[];
		totalCount: number;
		pageSize: number;
	}

	let { data, children }: { data: LayoutData; children: any } = $props();

	const initialPokemon = $derived(data.pokemon);
	const totalCount = $derived(data.totalCount);
	const pokemonData = usePokemonData(initialPokemon, totalCount);
	setPokemonDataContext(pokemonData);
	const panel = usePanelState(() => pokemonData.items);

	let sentinelEl: HTMLDivElement;

	onMount(() => {
		return pokemonData.setupInfiniteScroll(sentinelEl);
	});

	function handleSearch(query: string) {
		pokemonData.search(query);
	}
</script>

<div class="bg-muted/30 min-h-screen">
	<SearchHeader
		query={pokemonData.searchQuery}
		onQueryChange={handleSearch}
		count={pokemonData.items.length}
		totalLoaded={pokemonData.totalLoaded}
		isSearching={pokemonData.isSearching}
	/>

	<div class="mx-auto max-w-6xl px-4 py-6">
		<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each pokemonData.items as mon (mon.id)}
				<PokemonCard pokemon={mon} onclick={() => panel.openPeek(mon)} />
			{/each}

			{#if pokemonData.isLoading}
				{#each Array(8) as _, i (i)}
					<div class="bg-card rounded-2xl border p-4">
						<div class="flex items-start justify-between gap-3 pb-2">
							<div class="space-y-2">
								<Skeleton class="h-3 w-12" />
								<Skeleton class="h-5 w-24" />
							</div>
							<Skeleton class="h-14 w-14 rounded-xl" />
						</div>
						<div class="space-y-3 pt-2">
							<div class="flex gap-2">
								<Skeleton class="h-5 w-16 rounded-full" />
								<Skeleton class="h-5 w-14 rounded-full" />
							</div>
							<Skeleton class="h-10 w-full" />
							<Skeleton class="h-6 w-28 rounded-full" />
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<div bind:this={sentinelEl} class="h-4"></div>

		{#if pokemonData.hasMore && !pokemonData.isLoading}
			<div class="text-muted-foreground py-4 text-center text-sm">
				Scroll for more ({pokemonData.totalLoaded} of {totalCount} loaded)
			</div>
		{/if}
	</div>

	<PokemonPanel {panel}>
		{#if panel.isLoading && panel.activePokemon}
			{@const pokemon = panel.activePokemon}
			{@const form = pokemon.forms[0]}

			{#if pokemon.forms.length > 1}
				<div class="mb-4 flex flex-wrap items-center gap-2">
					<span class="text-muted-foreground text-xs">Form:</span>
					{#each pokemon.forms as f, idx (`${pokemon.id}-form-${idx}`)}
						<span
							class={cn(
								'whitespace-nowrap rounded-full border px-3 py-1 text-xs',
								idx === 0
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-background'
							)}
						>
							{f.name}
						</span>
					{/each}
				</div>
			{/if}

			<PokemonDetail {pokemon} {form} loading />

			<div class="h-4"></div>

			<Tabs.Root value="moves" class="w-full">
				<Tabs.List class="grid w-full grid-cols-2 rounded-2xl">
					<Tabs.Trigger value="moves">Moves</Tabs.Trigger>
					<Tabs.Trigger value="details">Details</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="moves" class="mt-4">
					<PokemonMoves loading />
				</Tabs.Content>
				<Tabs.Content value="details" class="mt-4">
					<PokemonDetailsTab loading />
				</Tabs.Content>
			</Tabs.Root>
		{:else}
			{@render children()}
		{/if}
	</PokemonPanel>

	<div class="bg-background border-t">
		<div class="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-xs">
			Peek panel - expand into full-width detail.
		</div>
	</div>
</div>
