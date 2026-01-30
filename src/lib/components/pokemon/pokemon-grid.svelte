<script lang="ts">
	import PokemonCard from './pokemon-card.svelte';
	import EntityGrid from '$lib/components/ui/entity-grid.svelte';
	import type { Pokemon } from '$lib/types/pokemon';
	import { pokemonUrl } from '$lib/utils/url';

	let {
		pokemon,
		isLoading = false,
		isRefreshing = false,
		skeletonCount = 8,
	}: {
		pokemon: Pokemon[];
		isLoading?: boolean;
		isRefreshing?: boolean;
		skeletonCount?: number;
	} = $props();
</script>

<EntityGrid items={pokemon} {isLoading} {isRefreshing} {skeletonCount}>
	{#snippet card(mon)}
		<PokemonCard pokemon={mon} href={pokemonUrl(mon.id)} />
	{/snippet}
	{#snippet skeleton()}
		<PokemonCard loading />
	{/snippet}
</EntityGrid>
