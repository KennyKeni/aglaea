<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		items,
		isLoading = false,
		isRefreshing = false,
		skeletonCount = 8,
		card,
		skeleton,
	}: {
		items: T[];
		isLoading?: boolean;
		isRefreshing?: boolean;
		skeletonCount?: number;
		card: Snippet<[T]>;
		skeleton: Snippet;
	} = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-6">
	<div
		class="grid gap-3 transition-opacity duration-150 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
		class:opacity-50={isRefreshing}
	>
		{#if isLoading}
			{#each Array(skeletonCount) as _, i (i)}
				{@render skeleton()}
			{/each}
		{:else}
			{#each items as item (item)}
				{@render card(item)}
			{/each}
		{/if}
	</div>
</div>
