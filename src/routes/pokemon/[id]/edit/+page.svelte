<svelte:head>
  <title>Edit {data.pokemon.name} | Pokedex</title>
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import DetailHeader from '$lib/components/ui/detail-header.svelte';
  import FormActionBar from '$lib/components/ui/form-action-bar.svelte';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import type { Pokemon } from '$lib/types/pokemon';
  import { formatId } from '$lib/utils/pokemon';

  interface PageData {
    pokemon: Pokemon;
  }

  let { data }: { data: PageData } = $props();

  function handleSave() {
    goto(`/pokemon/${data.pokemon.id}`, { invalidateAll: true });
  }

  function handleCancel() {
    goto(`/pokemon/${data.pokemon.id}`);
  }

  let isSaving = $state(false);
  let save = $state(() => {});

  const editorPromise = import('$lib/components/pokemon/pokemon-editor.svelte');
</script>

<div class="flex min-h-svh flex-col">
  <DetailHeader
    title="Edit: {data.pokemon.name} {formatId(data.pokemon.id)}"
    closeHref="/pokemon/{data.pokemon.id}"
  />

  <div class="flex-1 px-4 py-4 md:px-6 md:py-6">
    <div class="mx-auto max-w-5xl">
      {#await editorPromise}
        <LoadingSpinner class="py-20" />
      {:then { default: PokemonEditor }}
        <PokemonEditor
          pokemon={data.pokemon}
          onSave={handleSave}
          bind:isSaving
          bind:save
        />
      {/await}
    </div>
  </div>

  <FormActionBar
    onsave={save}
    oncancel={handleCancel}
    {isSaving}
  />
</div>
