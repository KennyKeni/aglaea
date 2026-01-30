<script lang="ts">
	import AbilityCard from './ability-card.svelte';
	import EntityGrid from '$lib/components/ui/entity-grid.svelte';
	import type { Ability } from '$lib/types/ability';

	let {
		abilities,
		isLoading = false,
		isRefreshing = false,
		skeletonCount = 8,
	}: {
		abilities: Ability[];
		isLoading?: boolean;
		isRefreshing?: boolean;
		skeletonCount?: number;
	} = $props();
</script>

<EntityGrid items={abilities} {isLoading} {isRefreshing} {skeletonCount}>
	{#snippet card(ability)}
		<AbilityCard {ability} href="/abilities/{ability.id}" />
	{/snippet}
	{#snippet skeleton()}
		<AbilityCard loading />
	{/snippet}
</EntityGrid>
