<script lang="ts">
  import { buttonVariants } from '$lib/components/ui/button';
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
    categories: FilterOption[];
  }

  let { categories }: Props = $props();

  const basePath = '/articles';
  const allParamNames = ['categories'];

  let isOpen = $state(false);
  let categorySearch = $state('');

  const filteredCategories = $derived(
    categorySearch
      ? categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
      : categories
  );

  const activeFilters = $derived(hasActiveFilters(allParamNames));
  const activeCount = $derived(getTotalActiveCount(allParamNames));

  function getAllSelectedOptions(): Array<{ option: FilterOption; paramName: string }> {
    const result: Array<{ option: FilterOption; paramName: string }> = [];
    for (const opt of getSelectedOptions('categories', categories)) {
      result.push({ option: opt, paramName: 'categories' });
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
        <button
          type="button"
          class={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-6 px-2 text-xs')}
          onclick={handleClearAll}
        >
          Clear all
        </button>
      </div>
    {/if}
  </div>

  <Collapsible.Content>
    <div class="flex flex-wrap gap-2 pb-4 pt-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <button {...props} class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
              Categories
              <Badge variant="secondary" class="h-5 w-6 justify-center tabular-nums">
                {getSelectedSlugs('categories').length}
              </Badge>
              <ChevronDown class="h-4 w-4" />
            </button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56">
          {#if categories.length > 10}
            <div class="p-2">
              <Input
                type="search"
                placeholder="Search categories..."
                class="h-8"
                bind:value={categorySearch}
              />
            </div>
          {/if}
          <div class="max-h-64 overflow-y-auto">
            {#each filteredCategories as option (option.id)}
              <DropdownMenu.CheckboxItem
                checked={isOptionSelected('categories', option.slug)}
                onCheckedChange={() => toggleFilterOption(basePath, 'categories', option.slug)}
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
