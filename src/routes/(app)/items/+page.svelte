<svelte:head>
	<title>Items | Aglaea</title>
</svelte:head>

<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ItemGrid, ItemFilters } from '$lib/components/items';
	import Pagination from '$lib/components/ui/pagination.svelte';
	import { itemStore } from '$lib/state/item-store.svelte';
	import type { Item } from '$lib/types/item';
	import type { FilterOption } from '$lib/utils/filters';
	import type { Streamable } from '$lib/utils/streaming';

	interface PageData {
		items: Streamable<Item[]>;
		filteredCount: Streamable<number>;
		currentPage: number;
		pageSize: number;
		tags: Streamable<FilterOption[]>;
	}

	let { data }: { data: PageData } = $props();

	let items: Item[] = $state([]);
	let filteredCount: number = $state(0);
	let tags: FilterOption[] = $state([]);
	let isLoading = $state(true);

	const hasCachedItems = $derived(
		itemStore.items.length > 0 && itemStore.currentPage === data.currentPage,
	);

	$effect(() => {
		itemStore.setListParams(page.url.searchParams);
	});

	$effect(() => {
		const p = data.items;
		if (p instanceof Promise) {
			if (!hasCachedItems) {
				isLoading = true;
			}
			p.then((resolved) => {
				items = resolved;
				isLoading = false;
			});
		} else {
			items = p;
			isLoading = false;
		}
	});

	$effect(() => {
		const fc = data.filteredCount;
		if (fc instanceof Promise) {
			fc.then((resolved) => {
				filteredCount = resolved;
			});
		} else {
			filteredCount = fc;
		}
	});

	$effect(() => {
		const t = data.tags;
		if (t instanceof Promise) {
			t.then((resolved) => {
				tags = resolved;
			});
		} else {
			tags = t;
		}
	});

	$effect(() => {
		if (!isLoading) {
			itemStore.setItems(items);
			itemStore.setPage(data.currentPage);
		}
	});

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(newPage));
		goto(`/items?${params.toString()}`, { keepFocus: true });
	}

	const displayItems = $derived.by(() => {
		if (hasCachedItems && isLoading) return itemStore.items;
		return items;
	});
</script>

<div class="mx-auto max-w-6xl px-4 pt-4">
	<ItemFilters {tags} />
</div>

<ItemGrid
	items={displayItems}
	isLoading={isLoading && !hasCachedItems}
	isRefreshing={false}
	skeletonCount={data.pageSize}
/>

{#if !page.url.searchParams.has('search') && filteredCount > 0}
	<div class="mx-auto max-w-6xl px-4 pb-8">
		<Pagination
			currentPage={data.currentPage}
			totalPages={Math.ceil(filteredCount / data.pageSize)}
			onPageChange={handlePageChange}
		/>
	</div>
{/if}
