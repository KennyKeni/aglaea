<script lang="ts">
  import { PokemonContent } from '$lib/components/pokemon';
  import DetailFooter from '$lib/components/ui/detail-footer.svelte';
  import DetailHeader from '$lib/components/ui/detail-header.svelte';
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

<DetailHeader
  title="{data.pokemon.name} {formatId(data.pokemon.id)}"
  closeHref={pokemonStore.getReturnHref('/pokemon')}
/>

<div class="px-4 py-4 md:px-6 md:py-6">
  <PokemonContent pokemon={data.pokemon} fullPokemon={data.pokemon} mode="full" />
</div>

<DetailFooter />
