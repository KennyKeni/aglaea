<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { TYPE_COLORS, clamp } from '$lib/utils/pokemon';
	import { X, Plus, MapPin, Droplets, Sparkles } from '@lucide/svelte';
	import { SearchPalette } from '$lib/components/search-palette';
	import { ImageUpload } from '$lib/components/ui/image-upload';
	import { getSearchSources } from '$lib/api/endpoints/search';
	import OverrideField from './override-field.svelte';
	import PokemonMoves from './pokemon-moves.svelte';
	import SpawnsEditor from './spawns-editor.svelte';
	import DropsEditor from './drops-editor.svelte';
	import type { PokemonFormEditor } from '$lib/state/pokemon-form-editor.svelte';
	import type { PokemonSpeciesEditor } from '$lib/state/pokemon-species-editor.svelte';
	import type { Pokemon, FormMove } from '$lib/types/pokemon';
	import { SvelteMap } from 'svelte/reactivity';
	import { methodOrder } from '$lib/config/pokemon';

	let {
		editor,
		speciesEditor,
		pokemon,
		initialMoveIds = new Set<string>(),
	}: {
		editor: PokemonFormEditor;
		speciesEditor: PokemonSpeciesEditor;
		pokemon: Pokemon | null;
		initialMoveIds?: Set<string>;
	} = $props();

	let typeSearchOpen = $state(false);
	let abilitySearchOpen = $state(false);

	const typeSources = getSearchSources(['types']);
	const abilitySources = getSearchSources(['abilities']);

	function handleNumberInput(setter: (v: number) => void) {
		return (e: Event) => {
			setter(Number((e.target as HTMLInputElement).value) || 0);
		};
	}

	const stats = $derived([
		{ label: 'HP', value: editor.baseStats.hp, key: 'hp' as const },
		{ label: 'Atk', value: editor.baseStats.attack, key: 'attack' as const },
		{ label: 'Def', value: editor.baseStats.defence, key: 'defence' as const },
		{ label: 'SpA', value: editor.baseStats.specialAttack, key: 'specialAttack' as const },
		{ label: 'SpD', value: editor.baseStats.specialDefence, key: 'specialDefence' as const },
		{ label: 'Spe', value: editor.baseStats.speed, key: 'speed' as const },
	]);

	const moveGroups = $derived.by(() => {
		const map = new SvelteMap<string, { slug: string; name: string; moves: FormMove[] }>();
		for (const mv of editor.formMoves) {
			const key = mv.method.slug;
			if (!map.has(key)) {
				map.set(key, { slug: key, name: mv.method.name, moves: [] });
			}
			map.get(key)!.moves.push(mv);
		}
		return [...map.values()].sort(
			(a, b) => (methodOrder[a.slug] ?? 99) - (methodOrder[b.slug] ?? 99),
		);
	});
</script>

<div class="space-y-4">
	<!-- Form Identity -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Form Identity</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 md:grid-cols-12">
				<div class="self-stretch md:col-span-4">
					<div class="flex h-full flex-col rounded-2xl bg-muted p-4">
						<div class="flex h-52 w-full flex-1 items-center justify-center md:h-auto">
							<ImageUpload
								bind:imageId={editor.coverImageId}
								bind:imageUrl={editor.coverImageUrl}
								class="h-full"
							/>
						</div>
					</div>
				</div>
				<div class="space-y-3 md:col-span-8">
					<label>
						<span class="text-xs font-medium text-muted-foreground">Form Name</span>
						<Input
							value={editor.name}
							oninput={(e) => (editor.name = (e.target as HTMLInputElement).value)}
							class="mt-1"
							placeholder="Form name"
						/>
					</label>
					<label>
						<span class="text-xs font-medium text-muted-foreground">Full Name</span>
						<Input
							value={editor.formName}
							oninput={(e) => (editor.formName = (e.target as HTMLInputElement).value)}
							class="mt-1"
							placeholder="Full display name"
						/>
					</label>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Types & Abilities -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Types & Abilities</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div>
				<div class="mb-2 text-xs font-medium text-muted-foreground">Types</div>
				<div class="flex flex-wrap gap-2">
					{#each editor.formTypes as { type }, i (type.id)}
						<span
							class={cn(
								'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
								TYPE_COLORS[type.slug] || 'bg-muted',
							)}
						>
							{type.name}
							<button
								type="button"
								onclick={() => editor.removeType(i)}
								class="ml-1 rounded-full hover:bg-black/20"
							>
								<X class="h-3 w-3" />
							</button>
						</span>
					{/each}
					<button
						type="button"
						onclick={() => (typeSearchOpen = true)}
						class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium hover:bg-muted/80"
					>
						<Plus class="h-3 w-3" />
					</button>
				</div>
			</div>
			<div>
				<div class="mb-2 text-xs font-medium text-muted-foreground">Abilities</div>
				<div class="flex flex-wrap gap-2">
					{#each editor.formAbilities as ab, i (`${ab.ability.id}-${ab.slot.id}`)}
						<Badge variant="outline" class="rounded-full px-3 py-1">
							{ab.ability.name}
							{#if ab.slot.slug === 'hidden'}
								<span class="ml-1 text-xs text-muted-foreground">(Hidden)</span>
							{/if}
							<button
								type="button"
								onclick={() => editor.removeAbility(i)}
								class="ml-1 rounded-full hover:bg-muted"
							>
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/each}
					<button
						type="button"
						onclick={() => (abilitySearchOpen = true)}
						class="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
					>
						<Plus class="h-3 w-3" />
						Add ability
					</button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Base Stats -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="text-base">Base Stats</Card.Title>
				<div class="text-xs text-muted-foreground tabular-nums">Total {editor.statTotal}</div>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				{#each stats as stat (stat.label)}
					<div class="grid grid-cols-12 items-center gap-3">
						<div class="col-span-2 text-xs text-muted-foreground">{stat.label}</div>
						<div class="col-span-6">
							<Progress value={(clamp(stat.value, 0, 255) / 255) * 100} class="h-2" />
						</div>
						<div class="col-span-4">
							<Input
								type="number"
								min="0"
								max="255"
								value={String(stat.value)}
								oninput={(e) =>
									editor.setBaseStat(stat.key, Number((e.target as HTMLInputElement).value))}
								class="h-7 text-right text-xs tabular-nums"
							/>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- EVs -->
	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">EV Yield</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each [
					{ label: 'HP', key: 'hp' },
					{ label: 'Atk', key: 'attack' },
					{ label: 'Def', key: 'defence' },
					{ label: 'SpA', key: 'specialAttack' },
					{ label: 'SpD', key: 'specialDefence' },
					{ label: 'Spe', key: 'speed' },
				] as ev (ev.key)}
					<div>
						<span class="text-xs text-muted-foreground">{ev.label}</span>
						<Input
							type="number"
							min="0"
							max="3"
							value={String(editor.evs[ev.key as keyof typeof editor.evs])}
							oninput={handleNumberInput((v) => editor.setEv(ev.key, v))}
							class="h-7 text-xs"
						/>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Training (base experience + overrides) -->
	<Card.Root id="training" class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Training</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Base Experience</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							value={String(editor.baseExperienceYield ?? '')}
							oninput={(e) => {
								const val = (e.target as HTMLInputElement).value;
								editor.baseExperienceYield = val ? Number(val) : null;
							}}
							class="h-8 font-semibold"
							placeholder="—"
						/>
					</div>
				</div>
				<OverrideField
					label="Catch Rate"
					bind:overridden={editor.overrideCatchRate}
					bind:value={editor.catchRate}
					speciesDefault={speciesEditor.catchRate}
					max={255}
				/>
				<OverrideField
					label="Base Friendship"
					bind:overridden={editor.overrideBaseFriendship}
					bind:value={editor.baseFriendship}
					speciesDefault={speciesEditor.baseFriendship}
					max={255}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Breeding overrides -->
	<Card.Root id="breeding" class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Breeding</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<OverrideField
					label="Egg Cycles"
					bind:overridden={editor.overrideEggCycles}
					bind:value={editor.eggCycles}
					speciesDefault={speciesEditor.eggCycles}
				/>
				<OverrideField
					label="Gender Ratio (Male %)"
					bind:overridden={editor.overrideMaleRatio}
					bind:value={editor.maleRatio}
					speciesDefault={speciesEditor.maleRatio}
					min={0}
					max={1}
					step={0.125}
					nullable={true}
					nullLabel="Genderless"
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Physical -->
	<Card.Root id="physical" class="rounded-2xl">
		<Card.Header>
			<Card.Title class="text-base">Physical</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Height (dm)</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							value={String(editor.height)}
							oninput={handleNumberInput((v) => (editor.height = v))}
							class="h-8 font-semibold"
						/>
					</div>
				</div>
				<div class="rounded-xl bg-muted p-3">
					<div class="text-xs font-medium text-muted-foreground">Weight (hg)</div>
					<div class="mt-1">
						<Input
							type="number"
							min="0"
							value={String(editor.weight)}
							oninput={handleNumberInput((v) => (editor.weight = v))}
							class="h-8 font-semibold"
						/>
					</div>
				</div>
				<OverrideField
					label="Base Scale"
					bind:overridden={editor.overrideBaseScale}
					bind:value={editor.baseScale}
					speciesDefault={speciesEditor.baseScale}
					min={0}
					step={0.01}
					nullable={true}
					nullLabel="—"
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Moves -->
	<div class="space-y-4">
		{#each moveGroups as group (group.name)}
			<PokemonMoves
				title={group.name}
				moves={group.moves}
				editing={true}
				bind:allMoves={editor.formMoves}
				methodSlug={group.slug}
				{initialMoveIds}
			/>
		{/each}
		{#if moveGroups.length === 0}
			<PokemonMoves
				title="Moves"
				moves={[]}
				editing={true}
				bind:allMoves={editor.formMoves}
				{initialMoveIds}
			/>
		{/if}
	</div>

	<!-- Labels -->
	<Card.Root id="labels" class="rounded-2xl">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-base">
				<Sparkles class="h-4 w-4" />
				Labels
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-wrap gap-2">
				{#each editor.formLabels as label, i (label.id)}
					<Badge variant="secondary" class="rounded-full">
						{label.name}
						<button
							type="button"
							onclick={() => editor.removeLabel(i)}
							class="ml-1 rounded-full hover:bg-muted"
						>
							<X class="h-3 w-3" />
						</button>
					</Badge>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Spawns & Drops -->
	<SpawnsEditor bind:spawns={editor.formSpawns} />
	<DropsEditor bind:drops={editor.formDrops} />
</div>

<SearchPalette
	bind:open={typeSearchOpen}
	sources={typeSources}
	onselect={(result) => editor.addType(result)}
	placeholder="Search types..."
/>
<SearchPalette
	bind:open={abilitySearchOpen}
	sources={abilitySources}
	onselect={(result) => editor.addAbility(result)}
	placeholder="Search abilities..."
/>
