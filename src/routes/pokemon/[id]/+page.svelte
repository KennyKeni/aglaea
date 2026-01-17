<script lang="ts">
  import { PokemonContent } from '$lib/components/pokemon';
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

<PokemonContent pokemon={data.pokemon} fullPokemon={data.pokemon} mode="full" />
