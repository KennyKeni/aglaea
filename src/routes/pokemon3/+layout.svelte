<script lang="ts">
	import {
		SearchHeader,
		PokemonCard,
		PokemonPanel,
		PokemonDetail,
		PokemonMoves,
		PokemonDetailsTab
	} from '$lib/components/pokemon';
	import * as Tabs from '$lib/components/ui/tabs';
	import { cn } from '$lib/utils';
	import { usePanelState } from '$lib/hooks/use-panel-state.svelte';
	import type { Pokemon } from './types';

	interface LayoutData {
		pokemon: Pokemon[];
	}

	let { data, children }: { data: LayoutData; children: any } = $props();

	let query = $state('');
	let filtered = $derived.by(() => {
		const s = query.trim().toLowerCase();
		if (!s) return data.pokemon;
		return data.pokemon.filter(
			(m) => m.name.toLowerCase().includes(s) || String(m.id).includes(s)
		);
	});

	const panel = usePanelState(data.pokemon);
</script>

<div class="bg-muted/30 min-h-screen">
	<SearchHeader bind:query count={filtered.length} />

	<div class="mx-auto max-w-6xl px-4 py-6">
		<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each filtered as mon (mon.id)}
				<PokemonCard pokemon={mon} onclick={() => panel.openPeek(mon)} />
			{/each}
		</div>
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
