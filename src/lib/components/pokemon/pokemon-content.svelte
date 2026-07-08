<script lang="ts">
  import PokemonDetail from './pokemon-detail.svelte';
  import PokemonMoves from './pokemon-moves.svelte';
  import PokemonDetailsTab from './pokemon-details-tab.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Maximize2 } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import type { Pokemon, FormMove } from '$lib/types/pokemon';
  import { methodOrder } from '$lib/config/pokemon';
  import { resolvePokemonFormIndex } from '$lib/utils/pokemon-detail';

  export type ContentMode = 'peek' | 'full' | 'loading';

  let {
    pokemon,
    fullPokemon = null,
    mode = 'full',
    initialFormId,
    onExpand,
  }: {
    pokemon: Pokemon;
    fullPokemon?: Pokemon | null;
    mode?: ContentMode;
    initialFormId?: number | undefined;
    onExpand?: () => void;
  } = $props();

  const dataSource = $derived(fullPokemon ?? pokemon);
  let formIndex = $derived(resolvePokemonFormIndex(dataSource.forms, initialFormId));
  const activeForm = $derived(dataSource.forms[formIndex] ?? null);
  const isLoading = $derived(mode === 'loading');
  const isPeek = $derived(mode === 'peek');

  const moveGroups = $derived.by(() => {
    if (!activeForm) return [];
    const groups: { slug: string; name: string; moves: FormMove[] }[] = [];
    for (const mv of activeForm.moves) {
      const key = mv.method.slug;
      let group = groups.find((candidate) => candidate.slug === key);
      if (!group) {
        group = { slug: key, name: mv.method.name, moves: [] };
        groups.push(group);
      }
      group.moves.push(mv);
    }
    return groups.sort((a, b) => (methodOrder[a.slug] ?? 99) - (methodOrder[b.slug] ?? 99));
  });
</script>

{#if activeForm}
  {#if dataSource.forms.length > 1}
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-xs text-muted-foreground">Form:</span>
      {#each dataSource.forms as form, idx (form.id)}
        <button
          onclick={() => (formIndex = idx)}
          class={cn(
            'rounded-full border px-3 py-1 text-xs whitespace-nowrap',
            formIndex === idx
              ? 'border-primary bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted',
          )}
        >
          {form.name}
        </button>
      {/each}
    </div>
  {/if}

  <div id="overview">
    <PokemonDetail pokemon={dataSource} form={activeForm} />
  </div>

  <div class="h-4"></div>

  {#if isPeek}
    <Tabs.Root value="moves" class="w-full">
      <Tabs.List class="grid w-full grid-cols-2 rounded-lg">
        <Tabs.Trigger value="moves">Moves</Tabs.Trigger>
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="moves" class="mt-4">
        <div class="rounded-lg border bg-card p-4">
          <div class="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold">Moves</h2>
              <div class="mt-1 text-sm text-muted-foreground">Expand for full list</div>
            </div>
            {#if onExpand}
              <Button variant="outline" size="sm" onclick={onExpand}>
                <Maximize2 class="mr-2 h-4 w-4" />
                Expand
              </Button>
            {/if}
          </div>
          <div class="space-y-2">
            {#each { length: 4 }, i (i)}
              <Skeleton class="h-14 w-full rounded-lg" />
            {/each}
          </div>
        </div>
      </Tabs.Content>

      <Tabs.Content value="details" class="mt-4">
        <div class="rounded-lg border bg-card p-4">
          <div class="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold">Details</h2>
              <div class="mt-1 text-sm text-muted-foreground">Expand for full info</div>
            </div>
            {#if onExpand}
              <Button variant="outline" size="sm" onclick={onExpand}>
                <Maximize2 class="mr-2 h-4 w-4" />
                Expand
              </Button>
            {/if}
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            {#each { length: 4 }, i (i)}
              <Skeleton class="h-20 w-full rounded-lg" />
            {/each}
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  {:else}
    <div class="space-y-8">
      {#each moveGroups as group (group.name)}
        <PokemonMoves
          title={group.name}
          moves={group.moves}
          loading={isLoading}
          methodSlug={group.slug}
        />
      {/each}
      <PokemonDetailsTab form={activeForm} pokemon={dataSource} loading={isLoading} />
    </div>
  {/if}
{/if}
