<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import SearchInput from './search-input.svelte';
	import SearchResults from './search-results.svelte';
	import type { SearchSource, SearchGroup, SearchResult } from '$lib/types/search';

	let {
		open = $bindable(false),
		sources,
		onselect,
		placeholder = 'Search...',
		limit = 5,
	}: {
		open?: boolean;
		sources: SearchSource[];
		onselect: (result: SearchResult) => void;
		placeholder?: string;
		limit?: number;
	} = $props();

	let query = $state('');
	let groups = $state<SearchGroup[]>([]);
	let activeIndex = $state(0);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	const flatResults = $derived(groups.flatMap((g) => g.results));

	function resetState() {
		query = '';
		groups = [];
		activeIndex = 0;
	}

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) resetState();
	}

	function performSearch(q: string) {
		if (!q.trim()) {
			groups = [];
			activeIndex = 0;
			return;
		}

		groups = sources.map((s) => ({
			source: s.kind,
			label: s.label,
			results: [],
			loading: true,
		}));
		activeIndex = 0;

		for (const source of sources) {
			source.search(q.trim(), limit).then((results) => {
				groups = groups.map((g) =>
					g.source === source.kind ? { ...g, results, loading: false } : g,
				);
			});
		}
	}

	$effect(() => {
		clearTimeout(debounceTimer);
		const q = query;
		debounceTimer = setTimeout(() => performSearch(q), 250);

		return () => clearTimeout(debounceTimer);
	});

	function selectResult(result: SearchResult) {
		onselect(result);
		open = false;
		resetState();
	}

	function handleKeydown(e: KeyboardEvent) {
		const total = flatResults.length;
		if (!total) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % total;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + total) % total;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const result = flatResults[activeIndex];
			if (result) selectResult(result);
		}
	}
</script>

<Dialog.Root open={open} onOpenChange={handleOpenChange}>
	<Dialog.Content
		showCloseButton={false}
		class="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
		onkeydown={handleKeydown}
	>
		<Dialog.Title class="sr-only">Search</Dialog.Title>
		<SearchInput bind:value={query} {placeholder} />
		<SearchResults
			{groups}
			{activeIndex}
			onselect={selectResult}
			onhover={(i) => (activeIndex = i)}
		/>
	</Dialog.Content>
</Dialog.Root>
