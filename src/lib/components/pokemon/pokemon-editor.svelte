<script lang="ts">
  import PokemonDetail from './pokemon-detail.svelte';
  import PokemonMoves from './pokemon-moves.svelte';
  import PokemonDetailsTab from './pokemon-details-tab.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Loader2 } from '@lucide/svelte';
  import { pokemon as pokemonApi } from '$lib/api/endpoints/pokemon';
  import type { Pokemon, Form, FormMove } from '$lib/types/pokemon';
  import { SvelteMap } from 'svelte/reactivity';
  import { methodOrder } from '$lib/config/pokemon';
  import type { SpeciesInput, FormInput } from '$lib/api/endpoints/pokemon';
  import { createPokemonFormEditor } from '$lib/state/pokemon-form-editor.svelte';

  let {
    pokemon = null,
    onSave,
    onCancel,
  }: {
    pokemon?: Pokemon | null;
    onSave: () => void;
    onCancel: () => void;
  } = $props();

  const isCreateMode = $derived(!pokemon);
  const editor = createPokemonFormEditor();

  let formIndex = $state(0);
  const initialForm = $derived(pokemon?.forms[formIndex] ?? null);

  let isSaving = $state(false);
  let error = $state('');
  let initialized = $state(false);

  $effect(() => {
    if (initialized) return;
    if (!pokemon) {
      initialized = true;
      return;
    }
    const form = pokemon.forms[formIndex];
    if (!form) {
      initialized = true;
      return;
    }

    editor.initFromPokemon(pokemon, form);
    initialized = true;
  });

  // Build derived objects that mirror the original shape for passing to display components
  const editedPokemon = $derived<Pokemon>({
    id: pokemon?.id ?? 0,
    name: editor.speciesName,
    slug: pokemon?.slug ?? '',
    description: editor.speciesDescription,
    generation: editor.speciesGeneration,
    experienceGroup: pokemon?.experienceGroup ?? null,
    eggGroups: pokemon?.eggGroups ?? [],
    hitbox: pokemon?.hitbox ?? null,
    lighting: pokemon?.lighting ?? null,
    riding: pokemon?.riding ?? null,
    forms: pokemon?.forms ?? [],
  });

  const editedForm = $derived<Form>({
    id: initialForm?.id ?? 0,
    name: editor.formName,
    fullName: initialForm?.fullName ?? editor.formName,
    slug: initialForm?.slug ?? '',
    description: initialForm?.description ?? null,
    generation: initialForm?.generation ?? null,
    height: editor.height,
    weight: editor.weight,
    catchRate: editor.catchRate,
    baseFriendship: editor.baseFriendship,
    eggCycles: editor.eggCycles,
    maleRatio: editor.maleRatio,
    baseScale: editor.baseScale,
    baseHp: editor.baseStats.hp,
    baseAttack: editor.baseStats.attack,
    baseDefence: editor.baseStats.defence,
    baseSpecialAttack: editor.baseStats.specialAttack,
    baseSpecialDefence: editor.baseStats.specialDefence,
    baseSpeed: editor.baseStats.speed,
    baseExperienceYield: editor.baseExperienceYield,
    evHp: editor.evs.hp,
    evAttack: editor.evs.attack,
    evDefence: editor.evs.defence,
    evSpecialAttack: editor.evs.specialAttack,
    evSpecialDefence: editor.evs.specialDefence,
    evSpeed: editor.evs.speed,
    labels: editor.formLabels,
    aspectChoices: initialForm?.aspectChoices ?? [],
    types: editor.formTypes,
    abilities: editor.formAbilities,
    moves: editor.formMoves,
    hitbox: initialForm?.hitbox ?? null,
    drops: editor.formDrops,
    aspectCombos: initialForm?.aspectCombos ?? [],
    behaviour: initialForm?.behaviour ?? null,
    spawns: editor.formSpawns,
  });

  const initialMoveIds = $derived.by(() => {
    const form = pokemon?.forms[formIndex];
    if (!form) return new Set<string>();
    return new Set(form.moves.map((m) => `${m.move.id}-${m.method.id}`));
  });

  // Group moves by method for display
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

  async function handleSave() {
    isSaving = true;
    error = '';

    const speciesInput: SpeciesInput = {
      name: editor.speciesName,
      description: editor.speciesDescription,
      generation: editor.speciesGeneration,
      experienceGroupId: editor.speciesExperienceGroupId,
      eggGroupIds: editor.speciesEggGroupIds,
    };

    const formInput: FormInput = {
      name: editor.formName,
      height: editor.height,
      weight: editor.weight,
      baseScale: editor.baseScale,
      catchRate: editor.catchRate,
      baseFriendship: editor.baseFriendship,
      baseExperienceYield: editor.baseExperienceYield,
      eggCycles: editor.eggCycles,
      maleRatio: editor.maleRatio,
      baseHp: editor.baseStats.hp,
      baseAttack: editor.baseStats.attack,
      baseDefence: editor.baseStats.defence,
      baseSpecialAttack: editor.baseStats.specialAttack,
      baseSpecialDefence: editor.baseStats.specialDefence,
      baseSpeed: editor.baseStats.speed,
      evHp: editor.evs.hp,
      evAttack: editor.evs.attack,
      evDefence: editor.evs.defence,
      evSpecialAttack: editor.evs.specialAttack,
      evSpecialDefence: editor.evs.specialDefence,
      evSpeed: editor.evs.speed,
      types: editor.formTypes.map((t) => ({ typeId: t.type.id, slot: t.slot })),
      abilities: editor.formAbilities.map((a) => ({ abilityId: a.ability.id, slotId: a.slot.id })),
      moves: editor.formMoves.map((m) => ({
        moveId: m.move.id,
        methodId: m.method.id,
        level: m.level,
      })),
      labelIds: editor.formLabels.map((l) => l.id),
    };

    if (isCreateMode) {
      const speciesResult = await pokemonApi.createSpecies(speciesInput);
      if (!speciesResult.ok) {
        error = speciesResult.message;
        isSaving = false;
        return;
      }
      const formResult = await pokemonApi.createForm({
        ...formInput,
        speciesId: speciesResult.data.id,
      });
      if (!formResult.ok) {
        error = formResult.message;
        isSaving = false;
        return;
      }
    } else {
      const speciesResult = await pokemonApi.updateSpecies(pokemon!.id, speciesInput);
      if (!speciesResult.ok) {
        error = speciesResult.message;
        isSaving = false;
        return;
      }
      const formResult = await pokemonApi.updateForm(editedForm.id, formInput);
      if (!formResult.ok) {
        error = formResult.message;
        isSaving = false;
        return;
      }
    }

    isSaving = false;
    onSave();
  }
</script>

{#if error}
  <div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
    {error}
  </div>
{/if}

<div class="space-y-4">
  <div id="overview">
    <PokemonDetail
      pokemon={editedPokemon}
      form={editedForm}
      editing={true}
      {editor}
    />
  </div>

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

  <PokemonDetailsTab
    form={editedForm}
    pokemon={editedPokemon}
    editing={true}
    {editor}
  />
</div>

<div class="sticky bottom-0 z-10 border-t bg-background/80 px-4 py-3 backdrop-blur">
  <div class="flex items-center justify-end gap-2">
    <Button variant="outline" onclick={onCancel} disabled={isSaving}>Cancel</Button>
    <Button onclick={handleSave} disabled={isSaving}>
      {#if isSaving}
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {isCreateMode ? 'Creating...' : 'Saving...'}
      {:else}
        {isCreateMode ? 'Create Pokemon' : 'Save Changes'}
      {/if}
    </Button>
  </div>
</div>
