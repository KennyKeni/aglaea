<svelte:head>
	<title>Abilities | Aglaea</title>
</svelte:head>

<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { AbilityGrid, AbilityFilters } from '$lib/components/abilities';
	import Pagination from '$lib/components/ui/pagination.svelte';
	import { abilityStore } from '$lib/state/ability-store.svelte';
	import type { Ability } from '$lib/types/ability';
	import type { Streamable } from '$lib/utils/streaming';

	interface PageData {
		abilities: Streamable<Ability[]>;
		filteredCount: Streamable<number>;
		currentPage: number;
		pageSize: number;
	}

	let { data }: { data: PageData } = $props();

	let abilities: Ability[] = $state([]);
	let filteredCount: number = $state(0);
	let isLoading = $state(true);

	const hasCachedItems = $derived(
		abilityStore.items.length > 0 && abilityStore.currentPage === data.currentPage,
	);

	$effect(() => {
		abilityStore.setListParams(page.url.searchParams);
	});

	$effect(() => {
		const p = data.abilities;
		if (p instanceof Promise) {
			if (!hasCachedItems) {
				isLoading = true;
			}
			p.then((resolved) => {
				abilities = resolved;
				isLoading = false;
			});
		} else {
			abilities = p;
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
		if (!isLoading) {
			abilityStore.setItems(abilities);
			abilityStore.setPage(data.currentPage);
		}
	});

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(newPage));
		goto(`/abilities?${params.toString()}`, { keepFocus: true });
	}

	const displayAbilities = $derived.by(() => {
		if (hasCachedItems && isLoading) return abilityStore.items;
		return abilities;
	});
</script>

<div class="mx-auto max-w-6xl px-4 pt-4">
	<AbilityFilters />
</div>

<AbilityGrid
	abilities={displayAbilities}
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
