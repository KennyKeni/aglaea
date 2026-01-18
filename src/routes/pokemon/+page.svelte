<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { PokemonGrid, PokemonFilters } from '$lib/components/pokemon';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import { getPokemonDataContext, getPanelContext } from '$lib/context/pokemon';
  import type { Pokemon } from '$lib/types/pokemon';
  import type { FilterOption } from '$lib/utils/filters';

  interface PageData {
    pokemon: Pokemon[] | Promise<Pokemon[]>;
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

  let resolvedPokemon: Pokemon[] = $state([]);
  let hasLoadedOnce = false;
  let isLoading = $state(true);
  let isRefreshing = $state(false);

  $effect(() => {
    const pokemon = data.pokemon;
    if (pokemon instanceof Promise) {
      if (hasLoadedOnce) {
        isRefreshing = true;
      } else {
        isLoading = true;
      }
      pokemon.then((resolved) => {
        resolvedPokemon = resolved;
        hasLoadedOnce = true;
        if (!pokemonData.searchQuery) {
          pokemonData.setItems(resolved);
          pokemonData.setPage(data.currentPage);
        }
        isLoading = false;
        isRefreshing = false;
      });
    } else {
      resolvedPokemon = pokemon;
      hasLoadedOnce = true;
      if (!pokemonData.searchQuery) {
        pokemonData.setItems(pokemon);
        pokemonData.setPage(data.currentPage);
      }
      isLoading = false;
      isRefreshing = false;
    }
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
  pokemon={pokemonData.searchQuery ? pokemonData.items : resolvedPokemon}
  {isLoading}
  {isRefreshing}
  skeletonCount={data.pageSize}
  onCardClick={(mon) => panelMode.openPeek(mon)}
/>

{#if !pokemonData.searchQuery && data.totalCount > 0}
  <div class="mx-auto max-w-6xl px-4 pb-8">
    <Pagination
      currentPage={data.currentPage}
      totalPages={Math.ceil(data.totalCount / data.pageSize)}
      onPageChange={handlePageChange}
    />
  </div>
{/if}
