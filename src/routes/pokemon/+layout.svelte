<script lang="ts">
  import { PokemonContent } from '$lib/components/pokemon';
  import EntityLayout from '$lib/components/ui/entity-layout.svelte';
  import { createPokemonSpeciesState } from '$lib/state/pokemon-data.svelte';
  import { setPokemonDataContext, setPanelContext } from '$lib/context/pokemon';
  import { formatId } from '$lib/utils/pokemon';
  import type { Pokemon } from '$lib/types/pokemon';

  let {
    data,
    children: content,
  }: { data: { totalCount: number; pageSize: number }; children: any } = $props();
</script>

<EntityLayout
  {data}
  basePath="/pokemon"
  pageDataKey="pokemon"
  footer="Pokemon Data from Smogon and Cobblemon"
  createState={(totalCount) => createPokemonSpeciesState([], totalCount, 1)}
  setDataContext={setPokemonDataContext}
  {setPanelContext}
  getTitle={(item: Pokemon) => item.name}
  getSubtitle={(item: Pokemon) => formatId(item.id)}
>
  {#snippet children()}
    {@render content()}
  {/snippet}

  {#snippet renderPeekContent(item: Pokemon)}
    <PokemonContent pokemon={item} mode="peek" />
  {/snippet}
</EntityLayout>
