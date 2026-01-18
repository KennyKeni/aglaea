<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Popover from '$lib/components/ui/popover';
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
    getStatRange,
    setStatRange,
    hasActiveStatFilter,
    getActiveStatFilterCount,
    clearStatFilter,
  } from '$lib/utils/filters';
  import StatRangeSlider from './stat-range-slider.svelte';

  interface Props {
    types: FilterOption[];
    abilities: FilterOption[];
    moves: FilterOption[];
  }

  let { types, abilities, moves }: Props = $props();

  const basePath = '/pokemon';
  const allParamNames = ['types', 'abilities', 'moves', 'generations'];
  const statParamNames = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'totalStats'];

  const STAT_MIN = 1;
  const STAT_MAX = 255;
  const BST_MIN = 1;
  const BST_MAX = 800;

  let isOpen = $state(false);
  let typeSearch = $state('');
  let abilitySearch = $state('');
  let moveSearch = $state('');

  const statConfigs = [
    { key: 'hp', label: 'HP', min: STAT_MIN, max: STAT_MAX },
    { key: 'attack', label: 'Attack', min: STAT_MIN, max: STAT_MAX },
    { key: 'defense', label: 'Defense', min: STAT_MIN, max: STAT_MAX },
    { key: 'specialAttack', label: 'Sp. Atk', min: STAT_MIN, max: STAT_MAX },
    { key: 'specialDefense', label: 'Sp. Def', min: STAT_MIN, max: STAT_MAX },
    { key: 'speed', label: 'Speed', min: STAT_MIN, max: STAT_MAX },
    { key: 'totalStats', label: 'Base Total', min: BST_MIN, max: BST_MAX },
  ] as const;

  const generations: FilterOption[] = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    slug: String(i + 1),
    name: `Gen ${i + 1}`,
  }));

  const filteredTypes = $derived(
    typeSearch ? types.filter((t) => t.name.toLowerCase().includes(typeSearch.toLowerCase())) : types
  );

  const filteredAbilities = $derived(
    abilitySearch
      ? abilities.filter((a) => a.name.toLowerCase().includes(abilitySearch.toLowerCase()))
      : abilities
  );

  const filteredMoves = $derived(
    moveSearch
      ? moves.filter((m) => m.name.toLowerCase().includes(moveSearch.toLowerCase()))
      : moves
  );

  const activeStatCount = $derived(getActiveStatFilterCount(statParamNames));
  const activeFilters = $derived(hasActiveFilters(allParamNames) || activeStatCount > 0);
  const activeCount = $derived(getTotalActiveCount(allParamNames) + activeStatCount);

  function getAllSelectedOptions(): Array<{ option: FilterOption; paramName: string }> {
    const result: Array<{ option: FilterOption; paramName: string }> = [];
    for (const opt of getSelectedOptions('types', types)) {
      result.push({ option: opt, paramName: 'types' });
    }
    for (const opt of getSelectedOptions('abilities', abilities)) {
      result.push({ option: opt, paramName: 'abilities' });
    }
    for (const opt of getSelectedOptions('moves', moves)) {
      result.push({ option: opt, paramName: 'moves' });
    }
    for (const opt of getSelectedOptions('generations', generations)) {
      result.push({ option: opt, paramName: 'generations' });
    }
    return result;
  }

  function getActiveStats(): Array<{ key: string; label: string }> {
    return statConfigs
      .filter((s) => hasActiveStatFilter(s.key))
      .map((s) => {
        const [min, max] = getStatRange(s.key, s.min, s.max);
        return { key: s.key, label: `${s.label}: ${min}-${max}` };
      });
  }

  function handleClearAll() {
    const flatStatParams = statParamNames.flatMap((name) => [`${name}Min`, `${name}Max`]);
    clearAllFilters(basePath, [...allParamNames, ...flatStatParams]);
  }

  function handleStatChange(key: string, value: [number, number], defaultMin: number, defaultMax: number) {
    setStatRange(basePath, key, value[0], value[1], defaultMin, defaultMax);
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
        {#each getActiveStats() as stat (stat.key)}
          <Badge variant="secondary" class="gap-1 pr-1">
            {stat.label}
            <button
              type="button"
              class="ml-1 rounded-full hover:bg-muted"
              onclick={() => clearStatFilter(basePath, stat.key)}
            >
              <X class="h-3 w-3" />
              <span class="sr-only">Remove {stat.label} filter</span>
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
      <!-- Types -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <button {...props} class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
              Types
              <Badge variant="secondary" class="h-5 w-6 justify-center tabular-nums">
                {getSelectedSlugs('types').length}
              </Badge>
              <ChevronDown class="h-4 w-4" />
            </button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56">
          <div class="p-2">
            <Input
              type="search"
              placeholder="Search types..."
              class="h-8"
              bind:value={typeSearch}
            />
          </div>
          <div class="max-h-64 overflow-y-auto">
            {#each filteredTypes as option (option.id)}
              <DropdownMenu.CheckboxItem
                checked={isOptionSelected('types', option.slug)}
                onCheckedChange={() => toggleFilterOption(basePath, 'types', option.slug)}
              >
                {option.name}
              </DropdownMenu.CheckboxItem>
            {/each}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <!-- Generations -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <button {...props} class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
              Generation
              <Badge variant="secondary" class="h-5 w-6 justify-center tabular-nums">
                {getSelectedSlugs('generations').length}
              </Badge>
              <ChevronDown class="h-4 w-4" />
            </button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-40">
          <div class="max-h-64 overflow-y-auto">
            {#each generations as option (option.id)}
              <DropdownMenu.CheckboxItem
                checked={isOptionSelected('generations', option.slug)}
                onCheckedChange={() => toggleFilterOption(basePath, 'generations', option.slug)}
              >
                {option.name}
              </DropdownMenu.CheckboxItem>
            {/each}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <!-- Abilities -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <button {...props} class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
              Abilities
              <Badge variant="secondary" class="h-5 w-6 justify-center tabular-nums">
                {getSelectedSlugs('abilities').length}
              </Badge>
              <ChevronDown class="h-4 w-4" />
            </button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-64">
          <div class="p-2">
            <Input
              type="search"
              placeholder="Search abilities..."
              class="h-8"
              bind:value={abilitySearch}
            />
          </div>
          <div class="max-h-64 overflow-y-auto">
            {#each filteredAbilities.slice(0, 50) as option (option.id)}
              <DropdownMenu.CheckboxItem
                checked={isOptionSelected('abilities', option.slug)}
                onCheckedChange={() => toggleFilterOption(basePath, 'abilities', option.slug)}
              >
                {option.name}
              </DropdownMenu.CheckboxItem>
            {/each}
            {#if filteredAbilities.length > 50}
              <div class="px-2 py-1 text-xs text-muted-foreground">
                +{filteredAbilities.length - 50} more, type to search...
              </div>
            {/if}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <!-- Moves -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <button {...props} class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
              Moves
              <Badge variant="secondary" class="h-5 w-6 justify-center tabular-nums">
                {getSelectedSlugs('moves').length}
              </Badge>
              <ChevronDown class="h-4 w-4" />
            </button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-64">
          <div class="p-2">
            <Input
              type="search"
              placeholder="Search moves..."
              class="h-8"
              bind:value={moveSearch}
            />
          </div>
          <div class="max-h-64 overflow-y-auto">
            {#each filteredMoves.slice(0, 50) as option (option.id)}
              <DropdownMenu.CheckboxItem
                checked={isOptionSelected('moves', option.slug)}
                onCheckedChange={() => toggleFilterOption(basePath, 'moves', option.slug)}
              >
                {option.name}
              </DropdownMenu.CheckboxItem>
            {/each}
            {#if filteredMoves.length > 50}
              <div class="px-2 py-1 text-xs text-muted-foreground">
                +{filteredMoves.length - 50} more, type to search...
              </div>
            {/if}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <!-- Stats -->
      <Popover.Root>
        <Popover.Trigger>
          {#snippet child({ props })}
            <button {...props} class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}>
              Stats
              <Badge variant="secondary" class="h-5 w-6 justify-center tabular-nums">
                {activeStatCount}
              </Badge>
              <ChevronDown class="h-4 w-4" />
            </button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-72">
          <div class="space-y-4">
            {#each statConfigs as stat (stat.key)}
              <StatRangeSlider
                label={stat.label}
                min={stat.min}
                max={stat.max}
                value={getStatRange(stat.key, stat.min, stat.max)}
                onValueChange={(v) => handleStatChange(stat.key, v, stat.min, stat.max)}
              />
            {/each}
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  </Collapsible.Content>
</Collapsible.Root>
