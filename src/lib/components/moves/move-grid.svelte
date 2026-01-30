<script lang="ts">
	import MoveCard from './move-card.svelte';
	import EntityGrid from '$lib/components/ui/entity-grid.svelte';
	import type { Move } from '$lib/types/move';

	let {
		moves,
		isLoading = false,
		isRefreshing = false,
		skeletonCount = 8,
	}: {
		moves: Move[];
		isLoading?: boolean;
		isRefreshing?: boolean;
		skeletonCount?: number;
	} = $props();
</script>

<EntityGrid items={moves} {isLoading} {isRefreshing} {skeletonCount}>
	{#snippet card(move)}
		<MoveCard {move} href="/moves/{move.id}" />
	{/snippet}
	{#snippet skeleton()}
		<MoveCard loading />
	{/snippet}
</EntityGrid>
