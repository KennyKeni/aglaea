<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	let {
		currentPage,
		totalPages,
		onPageChange
	}: {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	} = $props();

	function getPageNumbers(): (number | 'ellipsis')[] {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		if (currentPage <= 3) {
			return [1, 2, 3, 4, 'ellipsis', totalPages];
		}

		if (currentPage >= totalPages - 2) {
			return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
		}

		return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
	}

	const pages = $derived(getPageNumbers());
</script>

<nav class="flex items-center justify-center gap-1">
	<Button
		variant="outline"
		size="icon"
		class="cursor-pointer"
		disabled={currentPage === 1}
		onclick={() => onPageChange(currentPage - 1)}
	>
		<ChevronLeft />
	</Button>

	{#each pages as page}
		{#if page === 'ellipsis'}
			<span class="text-muted-foreground px-2">...</span>
		{:else}
			<Button
				variant={page === currentPage ? 'default' : 'outline'}
				size="icon"
				class="cursor-pointer"
				onclick={() => onPageChange(page)}
			>
				{page}
			</Button>
		{/if}
	{/each}

	<Button
		variant="outline"
		size="icon"
		class="cursor-pointer"
		disabled={currentPage === totalPages}
		onclick={() => onPageChange(currentPage + 1)}
	>
		<ChevronRight />
	</Button>
</nav>
