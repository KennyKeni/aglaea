<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Layers, Sun, Moon, Loader2 } from '@lucide/svelte';
	import { theme } from '$lib/stores/theme.svelte';

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

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onQueryChange(target.value);
	}
</script>

<div class="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
	<div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
		<div class="flex items-center gap-2 font-semibold">
			<Layers class="h-5 w-5" />
			Dex
		</div>
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
				placeholder="Search all 1025 Pokemon (name or #)"
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
		<Button variant="ghost" size="icon" onclick={() => theme.toggle()} aria-label="Toggle theme">
			{#if theme.isDark}
				<Sun class="h-5 w-5" />
			{:else}
				<Moon class="h-5 w-5" />
			{/if}
		</Button>
	</div>
</div>
