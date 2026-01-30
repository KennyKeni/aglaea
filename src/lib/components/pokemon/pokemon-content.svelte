<script lang="ts">
  import PokemonDetail from './pokemon-detail.svelte';
  import PokemonMoves from './pokemon-moves.svelte';
  import PokemonDetailsTab from './pokemon-details-tab.svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Maximize2 } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import type { Pokemon } from '$lib/types/pokemon';

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

  let formIndex = $state(0);

  const dataSource = $derived(fullPokemon ?? pokemon);
  const activeForm = $derived(dataSource.forms[formIndex] ?? null);
  const isLoading = $derived(mode === 'loading');
  const isPeek = $derived(mode === 'peek');

  $effect(() => {
    pokemon.id;
    if (initialFormId != null) {
      const idx = dataSource.forms.findIndex((f) => f.id === initialFormId);
      formIndex = idx >= 0 ? idx : 0;
    } else {
      formIndex = 0;
    }
  });
</script>

{#if activeForm}
  {#if dataSource.forms.length > 1}
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-xs text-muted-foreground">Form:</span>
      {#each dataSource.forms as form, idx (`${dataSource.id}-form-${idx}`)}
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
    <PokemonDetail pokemon={dataSource} form={activeForm} loading={isLoading} />
  </div>

  <div class="h-4"></div>

  {#if isPeek}
    <Tabs.Root value="moves" class="w-full">
      <Tabs.List class="grid w-full grid-cols-2 rounded-2xl">
        <Tabs.Trigger value="moves">Moves</Tabs.Trigger>
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="moves" class="mt-4">
        <Card.Root class="rounded-2xl">
          <Card.Header class="pb-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <Card.Title class="text-base">Moves</Card.Title>
                <div class="mt-1 text-sm text-muted-foreground">Expand for full list</div>
              </div>
              {#if onExpand}
                <Button variant="outline" size="sm" onclick={onExpand}>
                  <Maximize2 class="mr-2 h-4 w-4" />
                  Expand
                </Button>
              {/if}
            </div>
          </Card.Header>
          <Card.Content>
            <div class="space-y-2">
              {#each Array(4) as _, i (i)}
                <Skeleton class="h-14 w-full rounded-xl" />
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      <Tabs.Content value="details" class="mt-4">
        <Card.Root class="rounded-2xl">
          <Card.Header class="pb-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <Card.Title class="text-base">Details</Card.Title>
                <div class="mt-1 text-sm text-muted-foreground">Expand for full info</div>
              </div>
              {#if onExpand}
                <Button variant="outline" size="sm" onclick={onExpand}>
                  <Maximize2 class="mr-2 h-4 w-4" />
                  Expand
                </Button>
              {/if}
            </div>
          </Card.Header>
          <Card.Content>
            <div class="grid gap-3 sm:grid-cols-2">
              {#each Array(4) as _, i (i)}
                <Skeleton class="h-20 w-full rounded-xl" />
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      </Tabs.Content>
    </Tabs.Root>
  {:else}
    <div class="space-y-4">
      <PokemonMoves moves={activeForm.moves} loading={isLoading} />
      <PokemonDetailsTab form={activeForm} pokemon={dataSource} loading={isLoading} />
    </div>
  {/if}
{/if}
