<svelte:head>
  <title>Pokedex | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { PokemonGrid, PokemonFilters } from '$lib/components/pokemon';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import { getPokemonDataContext, getPanelContext } from '$lib/context/pokemon';
  import { StreamableResolver } from '$lib/state/streamable.svelte';
  import type { Pokemon } from '$lib/types/pokemon';
  import type { FilterOption } from '$lib/utils/filters';
  import type { Streamable } from '$lib/utils/streaming';

  interface PageData {
    pokemon: Streamable<Pokemon[]>;
    filteredCount: Streamable<number>;
    currentPage: number;
    totalCount: number;
    pageSize: number;
    types: FilterOption[];
    abilities: FilterOption[];
    moves: FilterOption[];
  }

  let { data }: { data: PageData } = $props();

  const pokemonData = getPokemonDataContext();
  const { mode: panelMode } = getPanelContext();

  const pokemon = new StreamableResolver<Pokemon[]>([]);
  const filteredCount = new StreamableResolver<number>(0);

  $effect(() => {
    pokemon.resolve(data.pokemon);
  });

  $effect(() => {
    if (!pokemon.loading && !pokemonData.searchQuery) {
      pokemonData.setItems(pokemon.value);
      pokemonData.setPage(data.currentPage);
    }
  });

  $effect(() => {
    filteredCount.resolve(data.filteredCount);
  });

  $effect(() => {
    const query = page.url.searchParams.get('search') || '';
    pokemonData.search(query);
  });

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(page.url.searchParams);
    params.set('page', String(newPage));
    goto(`/pokemon?${params.toString()}`, { keepFocus: true });
  }
</script>

<div class="mx-auto max-w-6xl px-4 pt-4">
  <PokemonFilters types={data.types} abilities={data.abilities} moves={data.moves} />
</div>

<PokemonGrid
  pokemon={pokemonData.searchQuery ? pokemonData.items : pokemon.value}
  isLoading={pokemon.loading}
  isRefreshing={pokemon.refreshing}
  skeletonCount={data.pageSize}
  onCardClick={(mon) => panelMode.openPeek(mon)}
/>

{#if !pokemonData.searchQuery && filteredCount.value > 0}
  <div class="mx-auto max-w-6xl px-4 pb-8">
    <Pagination
      currentPage={data.currentPage}
      totalPages={Math.ceil(filteredCount.value / data.pageSize)}
      onPageChange={handlePageChange}
    />
  </div>
{/if}
