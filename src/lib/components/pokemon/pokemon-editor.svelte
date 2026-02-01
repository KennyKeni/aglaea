<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Plus, X } from '@lucide/svelte';
	import { SearchPalette } from '$lib/components/search-palette';
	import { getSearchSources } from '$lib/api/endpoints/search';
	import { pokemon as pokemonApi } from '$lib/api/endpoints/pokemon';
	import type { Pokemon } from '$lib/types/pokemon';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { untrack } from 'svelte';
	import {
		createPokemonSpeciesEditor,
		type PokemonSpeciesEditor,
	} from '$lib/state/pokemon-species-editor.svelte';
	import {
		createPokemonFormEditor,
		type PokemonFormEditor,
	} from '$lib/state/pokemon-form-editor.svelte';
	import FormTabEditor from './form-tab-editor.svelte';

	let {
		pokemon,
		onSave,
		isSaving = $bindable(false),
		save = $bindable(() => {}),
	}: {
		pokemon: Pokemon;
		onSave: () => void;
		isSaving?: boolean;
		save?: () => void;
	} = $props();

	const speciesEditor: PokemonSpeciesEditor = createPokemonSpeciesEditor();
	const formEditors = new SvelteMap<string, PokemonFormEditor>();
	const initialImageIds = new SvelteMap<string, string | null>();

	let activeFormKey = $state<string>('');

	untrack(() => {
		speciesEditor.initFromPokemon(pokemon);

		const speciesDefaults = {
			catchRate: pokemon.catchRate,
			baseFriendship: pokemon.baseFriendship,
			eggCycles: pokemon.eggCycles,
			maleRatio: pokemon.maleRatio,
			baseScale: pokemon.baseScale,
		};

		for (const form of pokemon.forms) {
			const key = String(form.id);
			const editor = createPokemonFormEditor();
			editor.initFromForm(form, speciesDefaults);
			formEditors.set(key, editor);
			initialImageIds.set(key, form.image?.id ?? null);
		}

		if (pokemon.forms.length > 0) {
			activeFormKey = String(pokemon.forms[0]!.id);
		}
	});
	let newFormCounter = $state(0);

	let error = $state('');

	const pendingDeletes = new SvelteSet<number>();
	let deleteTargetKey = $state('');
	let deleteDialogOpen = $state(false);

	let eggGroupSearchOpen = $state(false);
	const eggGroupSources = getSearchSources(['items']); // egg groups don't have a search; placeholder

	const activeEditor = $derived(formEditors.get(activeFormKey) ?? null);

	const initialMoveIds = $derived.by(() => {
		if (!activeEditor || activeEditor.isNew) return new Set<string>();
		const form = pokemon.forms.find((f) => f.id === activeEditor.formId);
		if (!form) return new Set<string>();
		return new Set(form.moves.map((m) => `${m.move.id}-${m.method.id}`));
	});

	function addNewForm() {
		newFormCounter++;
		const key = `new-${newFormCounter}`;
		const editor = createPokemonFormEditor();
		editor.isNew = true;
		editor.name = '';
		editor.formName = '';
		formEditors.set(key, editor);
		activeFormKey = key;
	}

	function switchToNextForm(removedKey: string) {
		const keys = [...formEditors.keys()];
		const idx = keys.indexOf(removedKey);
		if (keys.length <= 1) {
			activeFormKey = '';
		} else if (idx > 0) {
			activeFormKey = keys[idx - 1]!;
		} else {
			activeFormKey = keys[1]!;
		}
	}

	function removeForm(key: string) {
		if (key.startsWith('new-')) {
			switchToNextForm(key);
			formEditors.delete(key);
		} else {
			deleteTargetKey = key;
			deleteDialogOpen = true;
		}
	}

	function confirmDeleteForm() {
		const editor = formEditors.get(deleteTargetKey);
		if (editor?.formId) {
			pendingDeletes.add(editor.formId);
		}
		switchToNextForm(deleteTargetKey);
		formEditors.delete(deleteTargetKey);
		deleteDialogOpen = false;
		deleteTargetKey = '';
	}

	function handleNumberInput(setter: (v: number) => void) {
		return (e: Event) => {
			setter(Number((e.target as HTMLInputElement).value) || 0);
		};
	}

	async function handleSave() {
		isSaving = true;
		error = '';

		// Save species
		const speciesResult = await pokemonApi.updateSpecies(pokemon.id, speciesEditor.toUpdateInput());
		if (!speciesResult.ok) {
			error = speciesResult.message;
			isSaving = false;
			return;
		}

		// Delete queued forms
		for (const formId of pendingDeletes) {
			const deleteResult = await pokemonApi.deleteForm(formId);
			if (!deleteResult.ok) {
				error = deleteResult.message;
				isSaving = false;
				return;
			}
		}
		pendingDeletes.clear();

		// Save all form editors
		for (const [key, editor] of formEditors) {
			if (editor.isNew) {
				const formResult = await pokemonApi.createForm(editor.toFormInput(pokemon.id));
				if (!formResult.ok) {
					error = formResult.message;
					isSaving = false;
					return;
				}
				const savedFormId = formResult.data.id;

				// Handle image upload for new form
				if (editor.coverImageId) {
					const imageResult = await pokemonApi.setFormImage(savedFormId, editor.coverImageId);
					if (!imageResult.ok) {
						error = imageResult.message;
						isSaving = false;
						return;
					}
				}
			} else {
				const formResult = await pokemonApi.updateForm(editor.formId!, editor.toFormInput());
				if (!formResult.ok) {
					error = formResult.message;
					isSaving = false;
					return;
				}

				// Handle image changes for existing form
				const initialImageId = initialImageIds.get(key) ?? null;
				if (editor.coverImageId !== initialImageId) {
					const imageResult = await pokemonApi.setFormImage(
						editor.formId!,
						editor.coverImageId,
					);
					if (!imageResult.ok) {
						error = imageResult.message;
						isSaving = false;
						return;
					}
				}
			}
		}

		isSaving = false;
		onSave();
	}

	save = handleSave;

	const formKeys = $derived([...formEditors.keys()]);
</script>

{#if error}
	<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
		{error}
	</div>
{/if}

<div class="space-y-4">
	<!-- Species Section -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Species</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-3 sm:grid-cols-2">
				<label>
					<span class="text-xs font-medium text-muted-foreground">Name</span>
					<Input
						value={speciesEditor.name}
						oninput={(e) => (speciesEditor.name = (e.target as HTMLInputElement).value)}
						class="mt-1"
						placeholder="Pokemon name"
					/>
				</label>
				<label>
					<span class="text-xs font-medium text-muted-foreground">Generation</span>
					<Input
						type="number"
						min="1"
						value={String(speciesEditor.generation)}
						oninput={handleNumberInput((v) => (speciesEditor.generation = v || 1))}
						class="mt-1"
					/>
				</label>
			</div>
			<label>
				<span class="text-xs font-medium text-muted-foreground">Description</span>
				<textarea
					value={speciesEditor.description ?? ''}
					oninput={(e) =>
						(speciesEditor.description = (e.target as HTMLTextAreaElement).value || null)}
					class="mt-1 w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					rows={3}
					placeholder="Pokemon description"
				></textarea>
			</label>

			<!-- Species defaults -->
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Catch Rate</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							max="255"
							value={String(speciesEditor.catchRate)}
							oninput={handleNumberInput((v) => (speciesEditor.catchRate = v))}
							class="h-8 font-semibold"
						/>
					</div>
				</div>
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Base Friendship</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							max="255"
							value={String(speciesEditor.baseFriendship)}
							oninput={handleNumberInput((v) => (speciesEditor.baseFriendship = v))}
							class="h-8 font-semibold"
						/>
					</div>
				</div>
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Egg Cycles</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							value={String(speciesEditor.eggCycles)}
							oninput={handleNumberInput((v) => (speciesEditor.eggCycles = v))}
							class="h-8 font-semibold"
						/>
					</div>
				</div>
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Gender Ratio (Male %)</div>
					<div class="mt-1 flex items-center gap-2">
						<Input
							type="number"
							min="0"
							max="1"
							step="0.125"
							value={speciesEditor.maleRatio !== null ? String(speciesEditor.maleRatio) : ''}
							oninput={(e) => {
								const val = (e.target as HTMLInputElement).value;
								speciesEditor.maleRatio = val ? Number(val) : null;
							}}
							class="h-8 font-semibold"
							placeholder="Genderless"
							disabled={speciesEditor.maleRatio === null}
						/>
						<label class="flex items-center gap-1 text-xs whitespace-nowrap">
							<input
								type="checkbox"
								checked={speciesEditor.maleRatio === null}
								onchange={(e) => {
									speciesEditor.maleRatio = (e.target as HTMLInputElement).checked
										? null
										: 0.5;
								}}
							/>
							Genderless
						</label>
					</div>
				</div>
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Base Scale</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							step="0.01"
							value={speciesEditor.baseScale !== null ? String(speciesEditor.baseScale) : ''}
							oninput={(e) => {
								const val = (e.target as HTMLInputElement).value;
								speciesEditor.baseScale = val ? Number(val) : null;
							}}
							class="h-8 font-semibold"
							placeholder="—"
						/>
					</div>
				</div>
			</div>

			{#if pokemon.experienceGroup}
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Experience Group</div>
					<div class="mt-1 font-semibold">{pokemon.experienceGroup.name}</div>
				</div>
			{/if}

			{#if pokemon.eggGroups.length}
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Egg Groups</div>
					<div class="mt-1 font-semibold">
						{pokemon.eggGroups.map((g) => g.name).join(', ')}
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Form Tabs -->
	{#if formKeys.length > 0}
		<Tabs.Root bind:value={activeFormKey} class="w-full">
			<div class="flex items-center gap-2">
				<Tabs.List class="flex-1">
					{#each formKeys as key (key)}
						{@const editor = formEditors.get(key)}
						<Tabs.Trigger value={key} class="group relative pr-7">
							{editor?.name || editor?.formName || 'New Form'}
							<button
								type="button"
								class="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 group-data-[state=active]:opacity-100"
								onclick={(e) => {
									e.stopPropagation();
									removeForm(key);
								}}
							>
								<X class="h-3 w-3" />
							</button>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>
				<Button variant="outline" size="icon-sm" onclick={addNewForm} type="button">
					<Plus class="h-4 w-4" />
				</Button>
			</div>

			{#each formKeys as key (key)}
				<Tabs.Content value={key} class="mt-4">
					{@const editor = formEditors.get(key)}
					{#if editor}
						<FormTabEditor
							{editor}
							{speciesEditor}
							{pokemon}
							{initialMoveIds}
						/>
					{/if}
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	{:else}
		<Card.Root class="rounded-2xl">
			<Card.Content class="flex items-center justify-center p-8">
				<Button variant="outline" onclick={addNewForm}>
					<Plus class="mr-2 h-4 w-4" />
					Add Form
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Form?</AlertDialog.Title>
			<AlertDialog.Description>
				This form will be permanently deleted when you save. This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDeleteForm}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

