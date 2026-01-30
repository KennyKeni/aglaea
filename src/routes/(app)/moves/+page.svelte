<svelte:head>
	<title>Moves | Aglaea</title>
</svelte:head>

<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { MoveGrid, MoveFilters } from '$lib/components/moves';
	import Pagination from '$lib/components/ui/pagination.svelte';
	import { moveStore } from '$lib/state/move-store.svelte';
	import type { Move } from '$lib/types/move';
	import type { FilterOption } from '$lib/utils/filters';
	import type { Streamable } from '$lib/utils/streaming';

	interface PageData {
		moves: Streamable<Move[]>;
		filteredCount: Streamable<number>;
		currentPage: number;
		pageSize: number;
		types: Streamable<FilterOption[]>;
		categories: Streamable<FilterOption[]>;
	}

	let { data }: { data: PageData } = $props();

	let moves: Move[] = $state([]);
	let filteredCount: number = $state(0);
	let types: FilterOption[] = $state([]);
	let categories: FilterOption[] = $state([]);
	let isLoading = $state(true);

	const hasCachedItems = $derived(
		moveStore.items.length > 0 && moveStore.currentPage === data.currentPage,
	);

	$effect(() => {
		moveStore.setListParams(page.url.searchParams);
	});

	$effect(() => {
		const p = data.moves;
		if (p instanceof Promise) {
			if (!hasCachedItems) {
				isLoading = true;
			}
			p.then((resolved) => {
				moves = resolved;
				isLoading = false;
			});
		} else {
			moves = p;
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
		const t = data.types;
		if (t instanceof Promise) {
			t.then((resolved) => {
				types = resolved;
			});
		} else {
			types = t;
		}
	});

	$effect(() => {
		const c = data.categories;
		if (c instanceof Promise) {
			c.then((resolved) => {
				categories = resolved;
			});
		} else {
			categories = c;
		}
	});

	$effect(() => {
		if (!isLoading) {
			moveStore.setItems(moves);
			moveStore.setPage(data.currentPage);
		}
	});

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(newPage));
		goto(`/moves?${params.toString()}`, { keepFocus: true });
	}

	const displayMoves = $derived.by(() => {
		if (hasCachedItems && isLoading) return moveStore.items;
		return moves;
	});
</script>

<div class="mx-auto max-w-6xl px-4 pt-4">
	<MoveFilters {types} {categories} />
</div>

<MoveGrid
	moves={displayMoves}
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
