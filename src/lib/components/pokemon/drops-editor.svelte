<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Droplets, X, Plus } from '@lucide/svelte';
  import { SearchPalette } from '$lib/components/search-palette';
  import { getSearchSources } from '$lib/api/endpoints/search';
  import type { SearchResult } from '$lib/types/search';
  import type { Drops, DropPercentage, DropRange } from '$lib/types/pokemon';

  let {
    drops = $bindable<Drops | null>(null),
  }: {
    drops?: Drops | null;
  } = $props();

  let itemSearchOpen = $state(false);
  const itemSources = getSearchSources(['items']);

  function ensureDrops(): Drops {
    if (!drops) {
      drops = { amount: 1, percentages: [], ranges: [] };
    }
    return drops;
  }

  function updateAmount(value: string) {
    const d = ensureDrops();
    drops = { ...d, amount: Number(value) || 1 };
  }

  function updatePercentage(index: number, field: string, value: string) {
    if (!drops) return;
    const percentages = drops.percentages.map((p, i) => {
      if (i !== index) return p;
      return { ...p, [field]: Number(value) || 0 };
    });
    drops = { ...drops, percentages };
  }

  function removePercentage(index: number) {
    if (!drops) return;
    drops = { ...drops, percentages: drops.percentages.filter((_, i) => i !== index) };
  }

  function updateRange(index: number, field: string, value: string) {
    if (!drops) return;
    const ranges = drops.ranges.map((r, i) => {
      if (i !== index) return r;
      return { ...r, [field]: Number(value) || 0 };
    });
    drops = { ...drops, ranges };
  }

  function removeRange(index: number) {
    if (!drops) return;
    drops = { ...drops, ranges: drops.ranges.filter((_, i) => i !== index) };
  }

  function addItem(result: SearchResult) {
    const d = ensureDrops();
    const exists = d.percentages.some((p) => p.item.id === result.id)
      || d.ranges.some((r) => r.item.id === result.id);
    if (exists) return;
    drops = {
      ...d,
      percentages: [...d.percentages, { item: { id: result.id, name: result.name }, percentage: 0 }],
    };
  }
</script>

<Card.Root id="drops" class="rounded-2xl">
  <Card.Header class="pb-3">
    <div class="flex items-center justify-between">
      <Card.Title class="flex items-center gap-2 text-base">
        <Droplets class="h-4 w-4" />
        Drops
      </Card.Title>
      <Button
        variant="outline"
        size="sm"
        class="h-7 gap-1"
        onclick={() => (itemSearchOpen = true)}
      >
        <Plus class="h-3.5 w-3.5" />
        Add item
      </Button>
    </div>
    {#if drops}
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Amount:</span>
        <Input
          type="number"
          min="0"
          value={String(drops.amount)}
          oninput={(e: Event) => updateAmount((e.target as HTMLInputElement).value)}
          class="h-6 w-16 text-xs"
        />
      </div>
    {/if}
  </Card.Header>
  <Card.Content>
    {#if drops}
      <div class="space-y-2">
        {#if drops.percentages.length}
          <div class="text-xs font-medium text-muted-foreground">Percentage Drops</div>
          {#each drops.percentages as drop, i (`percentage-${i}-${drop.item.id}`)}
            <div class="flex items-center justify-between gap-2 rounded-xl bg-muted p-3">
              <span class="font-medium">{drop.item.name}</span>
              <div class="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={String(drop.percentage)}
                  oninput={(e: Event) =>
                    updatePercentage(i, 'percentage', (e.target as HTMLInputElement).value)}
                  class="h-6 w-16 text-xs"
                />
                <span class="text-xs text-muted-foreground">%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7"
                  onclick={() => removePercentage(i)}
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/each}
        {/if}

        {#if drops.ranges.length}
          <div class="text-xs font-medium text-muted-foreground">Range Drops</div>
          {#each drops.ranges as drop, i (`range-${i}-${drop.item.id}`)}
            <div class="flex items-center justify-between gap-2 rounded-xl bg-muted p-3">
              <span class="font-medium">{drop.item.name}</span>
              <div class="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={String(drop.quantityMin)}
                  oninput={(e: Event) =>
                    updateRange(i, 'quantityMin', (e.target as HTMLInputElement).value)}
                  class="h-6 w-16 text-xs"
                />
                <span class="text-xs text-muted-foreground">–</span>
                <Input
                  type="number"
                  min="0"
                  value={String(drop.quantityMax)}
                  oninput={(e: Event) =>
                    updateRange(i, 'quantityMax', (e.target as HTMLInputElement).value)}
                  class="h-6 w-16 text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7"
                  onclick={() => removeRange(i)}
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/each}
        {/if}

        {#if !drops.percentages.length && !drops.ranges.length}
          <div class="text-sm text-muted-foreground">No drops configured.</div>
        {/if}
      </div>
    {:else}
      <div class="text-sm text-muted-foreground">No drops configured.</div>
    {/if}
  </Card.Content>
</Card.Root>

<SearchPalette
  bind:open={itemSearchOpen}
  sources={itemSources}
  onselect={addItem}
  placeholder="Search items..."
/>
