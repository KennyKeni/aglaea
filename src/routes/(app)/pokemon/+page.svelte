<svelte:head>
  <title>Pokedex | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { PokemonGrid, PokemonFilters } from '$lib/components/pokemon';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import CreateButton from '$lib/components/ui/create-button.svelte';
  import { pokemonStore } from '$lib/state/pokemon-store.svelte';
  import { Resource } from '$lib/types/auth';
  import type { Pokemon } from '$lib/types/pokemon';
  import type { FilterOption } from '$lib/utils/filters';
  import type { Streamable } from '$lib/utils/streaming';

  interface PageData {
    pokemon: Streamable<Pokemon[]>;
    filteredCount: Streamable<number>;
    currentPage: number;
    pageSize: number;
    types: Streamable<FilterOption[]>;
    abilities: Streamable<FilterOption[]>;
    moves: Streamable<FilterOption[]>;
  }

  let { data }: { data: PageData } = $props();

  let pokemon: Pokemon[] = $state([]);
  let filteredCount: number = $state(0);
  let types: FilterOption[] = $state([]);
  let abilities: FilterOption[] = $state([]);
  let moves: FilterOption[] = $state([]);
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
    const t = data.types;
    if (t instanceof Promise) {
      t.then((resolved) => {
        types = resolved;
      });
    } else {
      types = t;
    }
  });

  $effect(() => {
    const a = data.abilities;
    if (a instanceof Promise) {
      a.then((resolved) => {
        abilities = resolved;
      });
    } else {
      abilities = a;
    }
  });

  $effect(() => {
    const m = data.moves;
    if (m instanceof Promise) {
      m.then((resolved) => {
        moves = resolved;
      });
    } else {
      moves = m;
    }
  });

  $effect(() => {
    if (!isLoading) {
      pokemonStore.setItems(pokemon);
      pokemonStore.setPage(data.currentPage);
    }
  });

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(page.url.searchParams);
    params.set('page', String(newPage));
    goto(`/pokemon?${params.toString()}`, { keepFocus: true });
  }

  const displayPokemon = $derived.by(() => {
    if (hasCachedItems && isLoading) return pokemonStore.items;
    return pokemon;
  });
</script>

<div class="mx-auto max-w-6xl px-4 pt-4">
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <PokemonFilters {types} {abilities} {moves} />
    </div>
    <CreateButton resource={Resource.Pokemon} href="/pokemon/new" label="New Pokemon" />
  </div>
</div>

<PokemonGrid
  pokemon={displayPokemon}
  isLoading={isLoading && !hasCachedItems}
  isRefreshing={false}
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
