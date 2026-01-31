<script lang="ts">
  import { page } from '$app/state';
  import { PokemonContent } from '$lib/components/pokemon';
  import DetailFooter from '$lib/components/ui/detail-footer.svelte';
  import DetailHeader from '$lib/components/ui/detail-header.svelte';
  import Toc from '$lib/components/ui/toc.svelte';
  import EditButton from '$lib/components/ui/edit-button.svelte';
  import { pokemonStore } from '$lib/state/pokemon-store.svelte';
  import { formatId } from '$lib/utils/pokemon';
  import { Resource } from '$lib/types/auth';
  import type { Pokemon } from '$lib/types/pokemon';
  import type { TocItem } from '$lib/utils/toc';

  interface PageData {
    pokemon: Pokemon;
  }

  let { data }: { data: PageData } = $props();

  const pokemon = $derived(data.pokemon);
  const activeForm = $derived(pokemon.forms[0] ?? null);
  const initialFormId = $derived.by(() => {
    const raw = page.url.searchParams.get('form');
    return raw ? Number(raw) : undefined;
  });

  const toc = $derived.by(() => {
    const items: TocItem[] = [
      { id: 'pokemon-title', text: pokemon.name, level: 0 },
      { id: 'overview', text: 'Overview', level: 2 },
      { id: 'moves', text: 'Moves', level: 2 },
      { id: 'training', text: 'Training', level: 2 },
      { id: 'breeding', text: 'Breeding', level: 2 },
      { id: 'physical', text: 'Physical', level: 2 },
    ];
    if (activeForm?.labels?.length) {
      items.push({ id: 'labels', text: 'Labels', level: 2 });
    }
    if (activeForm?.spawns?.length) {
      items.push({ id: 'spawn-locations', text: 'Spawn Locations', level: 2 });
    }
    if (activeForm?.drops && (activeForm.drops.percentages.length || activeForm.drops.ranges.length)) {
      items.push({ id: 'drops', text: 'Drops', level: 2 });
    }
    return items;
  });
</script>

<svelte:head>
  <title>{pokemon.name} | Pokedex</title>
  <meta
    name="description"
    content={pokemon.description || `Details for ${pokemon.name}`}
  />
</svelte:head>

<div class="flex min-h-svh flex-col">
  <DetailHeader
    title="{pokemon.name} {formatId(pokemon.id)}"
    closeHref={pokemonStore.getReturnHref('/pokemon')}
  >
    {#snippet actions()}
      <EditButton resource={Resource.Pokemon} href="/pokemon/{pokemon.id}/edit" />
    {/snippet}
  </DetailHeader>

  <div class="flex-1 px-4 py-4 md:px-6 md:py-6">
    <div class="xl:grid xl:grid-cols-[1fr_auto] xl:gap-8">
      <div class="mx-auto max-w-5xl md:min-w-2xl">
        <PokemonContent pokemon={pokemon} fullPokemon={pokemon} mode="full" {initialFormId} />
      </div>
      {#if toc.length > 0}
        <aside class="hidden xl:block">
          <Toc {toc} />
        </aside>
      {/if}
    </div>
  </div>

  <DetailFooter />
</div>
