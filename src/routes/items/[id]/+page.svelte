<script lang="ts">
	import { ItemDetail } from '$lib/components/items';
	import DetailFooter from '$lib/components/ui/detail-footer.svelte';
	import DetailHeader from '$lib/components/ui/detail-header.svelte';
	import Toc from '$lib/components/ui/toc.svelte';
	import { itemStore } from '$lib/state/item-store.svelte';
	import type { Item } from '$lib/types/item';
	import type { TocItem } from '$lib/utils/toc';

	interface PageData {
		item: Item;
	}

	let { data }: { data: PageData } = $props();

	const item = $derived(data.item);

	const toc = $derived.by(() => {
		const items: TocItem[] = [
			{ id: 'item-title', text: item.name, level: 0 },
			{ id: 'overview', text: 'Overview', level: 2 },
		];
		if (item.tags.length > 0) {
			items.push({ id: 'tags', text: 'Tags', level: 2 });
		}
		if (item.boosts.length > 0) {
			items.push({ id: 'boosts', text: 'Stat Boosts', level: 2 });
		}
		if (item.flags.length > 0) {
			items.push({ id: 'flags', text: 'Flags', level: 2 });
		}
		if (item.recipes.length > 0) {
			items.push({ id: 'recipes', text: 'Recipes', level: 2 });
		}
		return items;
	});
</script>

<svelte:head>
	<title>{item.name} | Items</title>
	<meta name="description" content={item.shortDesc || item.desc || `Details for ${item.name}`} />
</svelte:head>

<div class="flex min-h-svh flex-col">
	<DetailHeader title={item.name} closeHref={itemStore.getReturnHref('/items')} />

	<div class="flex-1 px-4 py-4 md:px-6 md:py-6">
		<div class="xl:grid xl:grid-cols-[1fr_auto] xl:gap-8">
			<div class="mx-auto max-w-5xl">
				<ItemDetail {item} />
			</div>
			{#if toc.length > 0}
				<aside class="hidden xl:block">
					<Toc {toc} />
				</aside>
			{/if}
		</div>
	</div>

	<DetailFooter />
</div>
