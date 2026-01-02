<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Layers, Sun, Moon } from '@lucide/svelte';
	import { theme } from '$lib/stores/theme.svelte';

	let { query = $bindable(''), count }: { query: string; count: number } = $props();
</script>

<div class="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
	<div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
		<div class="flex items-center gap-2 font-semibold">
			<Layers class="h-5 w-5" />
			Dex
		</div>
		<div class="relative flex-1">
			<Search
				class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
			/>
			<Input bind:value={query} placeholder="Search Pokemon (name or #)" class="pl-9" />
		</div>
		<div class="text-muted-foreground hidden items-center gap-2 text-xs md:flex">
			<span class="bg-muted rounded-full px-3 py-1">{count} results</span>
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
