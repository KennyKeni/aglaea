<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { ChevronDown, ChevronUp, Filter, X } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import {
		type FilterOption,
		getSelectedSlugs,
		getSelectedOptions,
		isOptionSelected,
		toggleFilterOption,
		removeFilterOption,
		clearAllFilters,
		hasActiveFilters,
		getTotalActiveCount,
	} from '$lib/utils/filters';

	interface Props {
		tags: FilterOption[];
	}

	let { tags }: Props = $props();

	const basePath = '/items';
	const allParamNames = ['tags'];

	let isOpen = $state(false);
	let tagSearch = $state('');

	const filteredTags = $derived(
		tagSearch
			? tags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
			: tags,
	);

	const activeFilters = $derived(hasActiveFilters(allParamNames));
	const activeCount = $derived(getTotalActiveCount(allParamNames));

	function getAllSelectedOptions(): Array<{ option: FilterOption; paramName: string }> {
		const result: Array<{ option: FilterOption; paramName: string }> = [];
		for (const opt of getSelectedOptions('tags', tags)) {
			result.push({ option: opt, paramName: 'tags' });
		}
		return result;
	}

	function handleClearAll() {
		clearAllFilters(basePath, allParamNames);
	}
</script>

<Collapsible.Root bind:open={isOpen}>
	<div class="flex items-center gap-2 py-2">
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<button {...props} class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
					<Filter class="h-4 w-4" />
					Filters
					{#if activeFilters}
						<Badge variant="secondary" class="ml-1 h-5 px-1.5">
							{activeCount}
						</Badge>
					{/if}
					{#if isOpen}
						<ChevronUp class="h-4 w-4" />
					{:else}
						<ChevronDown class="h-4 w-4" />
					{/if}
				</button>
			{/snippet}
		</Collapsible.Trigger>

		{#if activeFilters}
			<div class="flex flex-wrap items-center gap-2">
				{#each getAllSelectedOptions() as { option, paramName } (`${paramName}-${option.slug}`)}
					<Badge variant="secondary" class="gap-1 pr-1">
						{option.name}
						<button
							type="button"
							class="ml-1 rounded-full hover:bg-muted"
							onclick={() => removeFilterOption(basePath, paramName, option.slug)}
						>
							<X class="h-3 w-3" />
							<span class="sr-only">Remove {option.name} filter</span>
						</button>
					</Badge>
				{/each}
				<Button variant="ghost" size="sm" class="h-6 px-2 text-xs" onclick={handleClearAll}>
					Clear all
				</Button>
			</div>
		{/if}
	</div>

	<Collapsible.Content>
		<div class="flex flex-wrap gap-2 pb-4 pt-2">
			<!-- Tags -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
						>
							Tags
							<Badge variant="secondary" class="h-5 w-6 justify-center tabular-nums">
								{getSelectedSlugs('tags').length}
							</Badge>
							<ChevronDown class="h-4 w-4" />
						</button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<div class="p-2">
						<Input
							type="search"
							placeholder="Search tags..."
							class="h-8"
							bind:value={tagSearch}
						/>
					</div>
					<div class="max-h-64 overflow-y-auto">
						{#each filteredTags as option (option.id)}
							<DropdownMenu.CheckboxItem
								checked={isOptionSelected('tags', option.slug)}
								onCheckedChange={() => toggleFilterOption(basePath, 'tags', option.slug)}
							>
								{option.name}
							</DropdownMenu.CheckboxItem>
						{/each}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
