<script lang="ts">
  import { PokemonContent } from '$lib/components/pokemon';
  import { Button } from '$lib/components/ui/button';
  import DetailFooter from '$lib/components/ui/detail-footer.svelte';
  import { X } from '@lucide/svelte';
  import { pokemonStore } from '$lib/state/pokemon-store.svelte';
  import { formatId } from '$lib/utils/pokemon';
  import type { Pokemon } from '$lib/types/pokemon';

  interface PageData {
    pokemon: Pokemon;
  }

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.pokemon.name} | Pokedex</title>
  <meta
    name="description"
    content={data.pokemon.description || `Details for ${data.pokemon.name}`}
  />
</svelte:head>

<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
  <div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
    <h1 class="min-w-0 truncate text-sm font-semibold">
      {data.pokemon.name}
      <span class="ml-2 text-muted-foreground">{formatId(data.pokemon.id)}</span>
    </h1>
    <Button variant="ghost" size="icon" href={pokemonStore.getReturnHref('/pokemon')} aria-label="Close">
      <X class="h-4 w-4" />
    </Button>
  </div>
</header>

<div class="px-4 py-4 md:px-6 md:py-6">
  <PokemonContent pokemon={data.pokemon} fullPokemon={data.pokemon} mode="full" />
</div>

<DetailFooter />
