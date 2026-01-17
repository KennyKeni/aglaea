<script lang="ts">
  import PokemonCard from './pokemon-card.svelte';
  import type { Pokemon } from '$lib/types/pokemon';

  let {
    pokemon,
    isLoading = false,
    onCardClick,
  }: {
    pokemon: Pokemon[];
    isLoading?: boolean;
    onCardClick: (mon: Pokemon) => void;
  } = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-6">
  <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {#if isLoading}
      {#each Array(8) as _, i (i)}
        <PokemonCard loading />
      {/each}
    {:else}
      {#each pokemon as mon (mon.id)}
        <PokemonCard pokemon={mon} onclick={() => onCardClick(mon)} />
      {/each}
    {/if}
  </div>
</div>
