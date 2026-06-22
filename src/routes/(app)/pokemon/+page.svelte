<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { PokemonGrid, PokemonFilters } from '$lib/components/pokemon';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import { pokemonStore } from '$lib/state/pokemon-store.svelte';
  import type { Pokemon } from '$lib/types/pokemon';
  import type { Streamable } from '$lib/utils/streaming';
  import { SvelteURLSearchParams } from 'svelte/reactivity';

  interface PageData {
    pokemon: Streamable<Pokemon[]>;
    filteredCount: Streamable<number>;
    currentPage: number;
    pageSize: number;
  }

  let { data }: { data: PageData } = $props();

  let pokemon: Pokemon[] = $state([]);
  let filteredCount: number = $state(0);
  let isLoading = $state(true);

  const hasCachedItems = $derived(
    pokemonStore.items.length > 0 && pokemonStore.currentPage === data.currentPage,
  );

  $effect(() => {
    pokemonStore.setListParams(page.url.searchParams);
  });

  $effect(() => {
    const p = data.pokemon;
    if (p instanceof Promise) {
      if (!hasCachedItems) {
        isLoading = true;
      }
      p.then((resolved) => {
        pokemon = resolved;
        isLoading = false;
      });
    } else {
      pokemon = p;
      isLoading = false;
    }
  });

  $effect(() => {
    const fc = data.filteredCount;
    if (fc instanceof Promise) {
      fc.then((resolved) => {
        filteredCount = resolved;
      });
    } else {
      filteredCount = fc;
    }
  });

  $effect(() => {
    if (!isLoading) {
      pokemonStore.setItems(pokemon);
      pokemonStore.setPage(data.currentPage);
    }
  });

  function handlePageChange(newPage: number) {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.set('page', String(newPage));
    goto(`${resolve('/pokemon')}?${params.toString()}`, { keepFocus: true });
  }

  const displayPokemon = $derived.by(() => {
    if (hasCachedItems && isLoading) return pokemonStore.items;
    return pokemon;
  });
</script>

<svelte:head>
  <title>Pokedex | Aglaea</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 pt-4">
  <PokemonFilters />
</div>

<PokemonGrid
  pokemon={displayPokemon}
  isLoading={isLoading && !hasCachedItems}
  isRefreshing={isLoading && hasCachedItems}
  skeletonCount={data.pageSize}
/>

{#if !page.url.searchParams.has('search') && filteredCount > 0}
  <div class="mx-auto max-w-6xl px-4 pb-8">
    <Pagination
      currentPage={data.currentPage}
      totalPages={Math.ceil(filteredCount / data.pageSize)}
      onPageChange={handlePageChange}
    />
  </div>
{/if}
