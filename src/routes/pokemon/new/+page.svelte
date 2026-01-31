<svelte:head>
  <title>New Pokemon | Pokedex</title>
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import DetailHeader from '$lib/components/ui/detail-header.svelte';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import { pokemonStore } from '$lib/state/pokemon-store.svelte';

  function handleSave() {
    goto('/pokemon', { invalidateAll: true });
  }

  function handleCancel() {
    goto(pokemonStore.getReturnHref('/pokemon'));
  }

  const editorPromise = import('$lib/components/pokemon/pokemon-editor.svelte');
</script>

<div class="flex min-h-svh flex-col">
  <DetailHeader title="New Pokemon" closeHref="/pokemon" />

  <div class="flex-1 px-4 py-4 md:px-6 md:py-6">
    <div class="mx-auto max-w-5xl">
      {#await editorPromise}
        <LoadingSpinner class="py-20" />
      {:then { default: PokemonEditor }}
        <PokemonEditor
          onSave={handleSave}
          onCancel={handleCancel}
        />
      {/await}
    </div>
  </div>
</div>
