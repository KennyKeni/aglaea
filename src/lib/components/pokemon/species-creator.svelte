<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';

	import { pokemon as pokemonApi } from '$lib/api/endpoints/pokemon';
	import {
		createPokemonSpeciesEditor,
		type PokemonSpeciesEditor,
	} from '$lib/state/pokemon-species-editor.svelte';

	let {
		onSave,
		isSaving = $bindable(false),
		save = $bindable(() => {}),
	}: {
		onSave: (slug: string) => void;
		isSaving?: boolean;
		save?: () => void;
	} = $props();

	const editor: PokemonSpeciesEditor = createPokemonSpeciesEditor();

	let error = $state('');

	async function handleSave() {
		if (!editor.name.trim()) {
			error = 'Name is required';
			return;
		}

		isSaving = true;
		error = '';

		const result = await pokemonApi.createSpecies(editor.toCreateInput());
		if (!result.ok) {
			error = result.message;
			isSaving = false;
			return;
		}

		isSaving = false;
		onSave(result.data.slug);
	}

	save = handleSave;
</script>

{#if error}
	<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
		{error}
	</div>
{/if}

<div class="space-y-4">
	<!-- Identity -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Identity</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<label>
					<span class="text-xs font-medium text-muted-foreground">Name *</span>
					<Input
						value={editor.name}
						oninput={(e) => (editor.name = (e.target as HTMLInputElement).value)}
						class="mt-1"
						placeholder="Pokemon name"
					/>
				</label>
				<label>
					<span class="text-xs font-medium text-muted-foreground">ID</span>
					<Input
						type="number"
						min="1"
						value={editor.id !== null ? String(editor.id) : ''}
						oninput={(e) => {
							const val = (e.target as HTMLInputElement).value;
							editor.id = val ? Number(val) : null;
						}}
						class="mt-1"
						placeholder="Auto-generate"
					/>
				</label>
			</div>
			<label>
				<span class="text-xs font-medium text-muted-foreground">Description</span>
				<textarea
					value={editor.description ?? ''}
					oninput={(e) =>
						(editor.description = (e.target as HTMLTextAreaElement).value || null)}
					class="mt-1 w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					rows={3}
					placeholder="Pokemon description"
				></textarea>
			</label>
		</Card.Content>
	</Card.Root>

	<!-- Details -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Details</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2">
				<label>
					<span class="text-xs font-medium text-muted-foreground">Generation</span>
					<Input
						type="number"
						min="1"
						value={String(editor.generation)}
						oninput={(e) =>
							(editor.generation = Number((e.target as HTMLInputElement).value) || 1)}
						class="mt-1"
					/>
				</label>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Training Defaults -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Training Defaults</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Catch Rate</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							max="255"
							value={String(editor.catchRate)}
							oninput={(e) =>
								(editor.catchRate = Number((e.target as HTMLInputElement).value) || 0)}
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
							value={String(editor.baseFriendship)}
							oninput={(e) =>
								(editor.baseFriendship = Number((e.target as HTMLInputElement).value) || 0)}
							class="h-8 font-semibold"
						/>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Breeding Defaults -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Breeding Defaults</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Egg Cycles</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							value={String(editor.eggCycles)}
							oninput={(e) =>
								(editor.eggCycles = Number((e.target as HTMLInputElement).value) || 0)}
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
							value={editor.maleRatio !== null ? String(editor.maleRatio) : ''}
							oninput={(e) => {
								const val = (e.target as HTMLInputElement).value;
								editor.maleRatio = val ? Number(val) : null;
							}}
							class="h-8 font-semibold"
							placeholder="Genderless"
							disabled={editor.maleRatio === null}
						/>
						<label class="flex items-center gap-1 text-xs whitespace-nowrap">
							<input
								type="checkbox"
								checked={editor.maleRatio === null}
								onchange={(e) => {
									editor.maleRatio = (e.target as HTMLInputElement).checked ? null : 0.5;
								}}
							/>
							Genderless
						</label>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Physical Default -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Physical Default</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Base Scale</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							step="0.01"
							value={editor.baseScale !== null ? String(editor.baseScale) : ''}
							oninput={(e) => {
								const val = (e.target as HTMLInputElement).value;
								editor.baseScale = val ? Number(val) : null;
							}}
							class="h-8 font-semibold"
							placeholder="—"
						/>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

