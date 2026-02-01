<svelte:head>
	<title>New Pokemon | Pokedex</title>
</svelte:head>

<script lang="ts">
	import { goto } from '$app/navigation';
	import DetailHeader from '$lib/components/ui/detail-header.svelte';
	import FormActionBar from '$lib/components/ui/form-action-bar.svelte';
	import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
	import { pokemonStore } from '$lib/state/pokemon-store.svelte';

	function handleSave(slug: string) {
		goto(`/pokemon/${slug}/edit`, { invalidateAll: true });
	}

	function handleCancel() {
		goto(pokemonStore.getReturnHref('/pokemon'));
	}

	let isSaving = $state(false);
	let save = $state(() => {});

	const creatorPromise = import('$lib/components/pokemon/species-creator.svelte');
</script>

<div class="flex min-h-svh flex-col">
	<DetailHeader title="New Pokemon" closeHref="/pokemon" />

	<div class="flex-1 px-4 py-4 md:px-6 md:py-6">
		<div class="mx-auto max-w-5xl">
			{#await creatorPromise}
				<LoadingSpinner class="py-20" />
			{:then { default: SpeciesCreator }}
				<SpeciesCreator
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
		saveLabel="Create Species"
		savingLabel="Creating..."
	/>
</div>
