<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search, Loader2 } from '@lucide/svelte';
	import { useScrollDirection } from '$lib/hooks/use-scroll-direction.svelte';

	let {
		query = '',
		onQueryChange,
		count,
		totalLoaded = 0,
		isSearching = false
	}: {
		query: string;
		onQueryChange: (query: string) => void;
		count: number;
		totalLoaded?: number;
		isSearching?: boolean;
	} = $props();

	const scroll = useScrollDirection();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onQueryChange(target.value);
	}
</script>

<div
	class="bg-background/80 sticky top-0 z-20 border-b backdrop-blur transition-transform duration-300 md:top-14"
	class:-translate-y-full={scroll.isScrollingDown}
>
	<div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
		<div class="relative flex-1">
			{#if isSearching}
				<Loader2
					class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin"
				/>
			{:else}
				<Search
					class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
				/>
			{/if}
			<Input
				value={query}
				oninput={handleInput}
				placeholder="Search articles by title"
				class="pl-9"
			/>
		</div>
		<div class="text-muted-foreground hidden items-center gap-2 text-xs md:flex">
			<span class="bg-muted rounded-full px-3 py-1">
				{#if query}
					{count} found
				{:else}
					{totalLoaded} loaded
				{/if}
			</span>
		</div>
	</div>
</div>
