<script lang="ts">
	import { Search } from '@lucide/svelte';

	let {
		value = $bindable(''),
		placeholder = 'Search...',
	}: {
		value?: string;
		placeholder?: string;
	} = $props();

	let inputEl: HTMLInputElement | null = $state(null);

	$effect(() => {
		inputEl?.focus();
	});
</script>

<div class="flex items-center gap-2 border-b px-3">
	<Search class="h-4 w-4 shrink-0 text-muted-foreground" />
	<input
		bind:this={inputEl}
		bind:value
		{placeholder}
		class="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
	/>
</div>
