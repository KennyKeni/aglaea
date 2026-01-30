<script lang="ts">
	import ItemCard from './item-card.svelte';
	import EntityGrid from '$lib/components/ui/entity-grid.svelte';
	import type { Item } from '$lib/types/item';
	import { itemUrl } from '$lib/utils/url';

	let {
		items,
		isLoading = false,
		isRefreshing = false,
		skeletonCount = 8,
	}: {
		items: Item[];
		isLoading?: boolean;
		isRefreshing?: boolean;
		skeletonCount?: number;
	} = $props();
</script>

<EntityGrid {items} {isLoading} {isRefreshing} {skeletonCount}>
	{#snippet card(item)}
		<ItemCard {item} href={itemUrl(item.id)} />
	{/snippet}
	{#snippet skeleton()}
		<ItemCard loading />
	{/snippet}
</EntityGrid>
