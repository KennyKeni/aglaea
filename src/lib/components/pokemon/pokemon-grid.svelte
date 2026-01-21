<script lang="ts">
  import PokemonCard from './pokemon-card.svelte';
  import type { Pokemon } from '$lib/types/pokemon';

  let {
    pokemon,
    isLoading = false,
    isRefreshing = false,
    skeletonCount = 8,
  }: {
    pokemon: Pokemon[];
    isLoading?: boolean;
    isRefreshing?: boolean;
    skeletonCount?: number;
  } = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-6">
  <div
    class="grid gap-3 transition-opacity duration-150 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    class:opacity-50={isRefreshing}
  >
    {#if isLoading}
      {#each Array(skeletonCount) as _, i (i)}
        <PokemonCard loading />
      {/each}
    {:else}
      {#each pokemon as mon (mon.id)}
        <PokemonCard pokemon={mon} href="/pokemon/{mon.id}" />
      {/each}
    {/if}
  </div>
</div>
