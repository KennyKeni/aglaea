<script lang="ts">
	import { Loader2 } from '@lucide/svelte';
	import SearchResultItem from './search-result-item.svelte';
	import type { SearchGroup, SearchResult } from '$lib/types/search';

	let {
		groups,
		activeIndex = 0,
		onselect,
		onhover,
	}: {
		groups: SearchGroup[];
		activeIndex?: number;
		onselect: (result: SearchResult) => void;
		onhover: (index: number) => void;
	} = $props();

	const flatIndexMap = $derived.by(() => {
		const map = new Map<string, number>();
		let idx = 0;
		for (const group of groups) {
			for (const result of group.results) {
				map.set(`${group.source}-${result.id}`, idx++);
			}
		}
		return map;
	});

	const anyLoading = $derived(groups.some((g) => g.loading));
	const hasResults = $derived(flatIndexMap.size > 0);
	const hasQuery = $derived(groups.length > 0);

	function getFlatIndex(source: string, id: number): number {
		return flatIndexMap.get(`${source}-${id}`) ?? -1;
	}
</script>

<div class="max-h-72 overflow-y-auto p-2">
	{#if hasResults}
		{#each groups as group (group.source)}
			{#if group.results.length > 0}
				<div class="mb-1">
					<div class="flex items-center gap-2 px-3 py-1.5">
						<span class="text-xs font-medium text-muted-foreground">{group.label}</span>
						{#if group.loading}
							<Loader2 class="h-3 w-3 animate-spin text-muted-foreground" />
						{/if}
					</div>
					{#each group.results as result (result.id)}
						{@const idx = getFlatIndex(group.source, result.id)}
						<SearchResultItem
							{result}
							active={idx === activeIndex}
							onselect={() => onselect(result)}
							onhover={() => onhover(idx)}
						/>
					{/each}
				</div>
			{/if}
		{/each}
	{:else if anyLoading}
		<div class="flex items-center justify-center py-6">
			<Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
		</div>
	{:else if hasQuery}
		<div class="py-6 text-center text-sm text-muted-foreground">No results found.</div>
	{:else}
		<div class="py-6 text-center text-sm text-muted-foreground">Type to search...</div>
	{/if}
</div>
