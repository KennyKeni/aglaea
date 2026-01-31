<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { SearchResult } from '$lib/types/search';

	let {
		result,
		active = false,
		onselect,
		onhover,
	}: {
		result: SearchResult;
		active?: boolean;
		onselect: () => void;
		onhover: () => void;
	} = $props();

	let el: HTMLButtonElement | null = $state(null);

	$effect(() => {
		if (active) {
			el?.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

<button
	bind:this={el}
	type="button"
	class={cn(
		'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
		active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
	)}
	onclick={onselect}
	onmouseenter={onhover}
>
	<span class="truncate font-medium">{result.name}</span>
	<Badge variant="outline" class="ml-2 shrink-0 text-xs capitalize">{result.source}</Badge>
</button>
