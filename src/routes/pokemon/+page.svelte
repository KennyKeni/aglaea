<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { PokemonGrid } from '$lib/components/pokemon';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import { getPokemonDataContext, getPanelContext } from '$lib/context/pokemon';
  import type { Pokemon } from '$lib/types/pokemon';

  interface PageData {
    pokemon: Pokemon[];
    currentPage: number;
    totalCount: number;
    pageSize: number;
  }

  let { data }: { data: PageData } = $props();

  const pokemonData = getPokemonDataContext();
  const { mode: panelMode } = getPanelContext();

  $effect(() => {
    if (!pokemonData.searchQuery) {
      pokemonData.setItems(data.pokemon);
      pokemonData.setPage(data.currentPage);
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

<PokemonGrid
  pokemon={pokemonData.items}
  isLoading={false}
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
