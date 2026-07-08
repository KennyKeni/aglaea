<script lang="ts">
  import { page } from '$app/state';
  import { PokemonContent } from '$lib/components/pokemon';
  import DetailFooter from '$lib/components/ui/detail-footer.svelte';
  import DetailHeader from '$lib/components/ui/detail-header.svelte';
  import Toc from '$lib/components/ui/toc.svelte';
  import { pokemonStore } from '$lib/state/pokemon-store.svelte';
  import { formatId } from '$lib/utils/pokemon';
  import { buildPokemonDetailToc, resolvePokemonForm } from '$lib/utils/pokemon-detail';
  import type { Pokemon } from '$lib/types/pokemon';

  interface PageData {
    pokemon: Pokemon;
  }

  let { data }: { data: PageData } = $props();

  const pokemon = $derived(data.pokemon);
  const initialFormId = $derived.by(() => {
    const raw = page.url.searchParams.get('form');
    return raw ? Number(raw) : undefined;
  });
  const activeForm = $derived(resolvePokemonForm(pokemon.forms, initialFormId));
  const toc = $derived(buildPokemonDetailToc(pokemon, activeForm));
</script>

<svelte:head>
  <title>{pokemon.name} | Pokedex</title>
  <meta name="description" content={pokemon.description || `Details for ${pokemon.name}`} />
</svelte:head>

<div class="flex min-h-svh flex-col">
  <DetailHeader
    title="{pokemon.name} {formatId(pokemon.id)}"
    closeHref={pokemonStore.getReturnHref('/pokemon')}
  />

  <div class="flex-1 px-6 py-6 md:px-8 lg:px-12">
    <div class="xl:grid xl:grid-cols-[1fr_auto] xl:gap-8">
      <div class="mx-auto max-w-6xl md:min-w-2xl">
        <PokemonContent {pokemon} fullPokemon={pokemon} mode="full" {initialFormId} />
      </div>
      {#if toc.length > 0}
        <aside class="hidden xl:block">
          <Toc {toc} />
        </aside>
      {/if}
    </div>
  </div>

  <DetailFooter />
</div>
