<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { cn } from '$lib/utils';
  import { TYPE_COLORS, formatId, getArtworkUrl, getStatTotal, clamp } from '$lib/utils/pokemon';
  import { abilityUrl } from '$lib/utils/url';
  import { X, Plus } from '@lucide/svelte';
  import { SearchPalette } from '$lib/components/search-palette';
  import { getSearchSources } from '$lib/api/endpoints/search';
  import type { Pokemon, Form } from '$lib/types/pokemon';
  import type { PokemonFormEditor } from '$lib/state/pokemon-form-editor.svelte';

  let {
    pokemon,
    form,
    loading = false,
    editing = false,
    editor,
  }: {
    pokemon: Pokemon;
    form: Form;
    loading?: boolean;
    editing?: boolean;
    editor?: PokemonFormEditor;
  } = $props();

  const STAT_KEYS = ['hp', 'attack', 'defence', 'specialAttack', 'specialDefence', 'speed'] as const;

  const stats = $derived([
    { label: 'HP', value: editing && editor ? editor.baseStats.hp : form.baseHp, key: 'hp' as const },
    { label: 'Atk', value: editing && editor ? editor.baseStats.attack : form.baseAttack, key: 'attack' as const },
    { label: 'Def', value: editing && editor ? editor.baseStats.defence : form.baseDefence, key: 'defence' as const },
    { label: 'SpA', value: editing && editor ? editor.baseStats.specialAttack : form.baseSpecialAttack, key: 'specialAttack' as const },
    { label: 'SpD', value: editing && editor ? editor.baseStats.specialDefence : form.baseSpecialDefence, key: 'specialDefence' as const },
    { label: 'Spe', value: editing && editor ? editor.baseStats.speed : form.baseSpeed, key: 'speed' as const },
  ]);

  const statTotal = $derived(
    editing && editor
      ? editor.statTotal
      : getStatTotal(form),
  );

  const displayTypes = $derived(editing && editor ? editor.formTypes : form.types);
  const displayAbilities = $derived(editing && editor ? editor.formAbilities : form.abilities);

  let typeSearchOpen = $state(false);
  let abilitySearchOpen = $state(false);

  const typeSources = getSearchSources(['types']);
  const abilitySources = getSearchSources(['abilities']);
</script>

<Card.Root class="rounded-2xl">
  <Card.Content class="p-4 md:p-6">
    <div class="grid gap-4 md:grid-cols-12">
      <div class="self-stretch md:col-span-4">
        <div class="flex h-full flex-col rounded-2xl bg-muted p-4 md:p-5">
          <div class="flex h-52 w-full flex-1 items-center justify-center md:h-auto">
            <img
              src={getArtworkUrl(pokemon.id)}
              alt={form.name}
              class="h-full w-full object-contain"
            />
          </div>
          <div class="mt-3 text-center">
            {#if editing && editor}
              <Input
                value={editor.formName}
                oninput={(e: Event) => (editor.formName = (e.target as HTMLInputElement).value)}
                class="text-center text-base font-semibold"
                placeholder="Form name"
              />
            {:else}
              <div class="text-base font-semibold">{form.name}</div>
            {/if}
          </div>
        </div>
      </div>

      <div class="space-y-3 md:col-span-8">
        <div class="grid grid-cols-2 items-start gap-3">
          <div>
            <div class="text-xs font-medium text-muted-foreground">
              {formatId(pokemon.id)}
            </div>
            {#if editing && editor}
              <Input
                value={editor.speciesName}
                oninput={(e: Event) => (editor.speciesName = (e.target as HTMLInputElement).value)}
                class="text-3xl font-semibold"
                placeholder="Pokemon name"
              />
            {:else}
              <div id="pokemon-title" class="text-3xl font-semibold">{pokemon.name}</div>
            {/if}
          </div>
          <div class="flex flex-wrap justify-end gap-2">
            {#each displayTypes as { type }, i (type.id)}
              <span
                class={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  TYPE_COLORS[type.slug] || 'bg-muted',
                )}
              >
                {type.name}
                {#if editing && editor}
                  <button
                    type="button"
                    onclick={() => editor.removeType(i)}
                    class="ml-1 rounded-full hover:bg-black/20"
                  >
                    <X class="h-3 w-3" />
                  </button>
                {/if}
              </span>
            {/each}
            {#if editing && editor}
              <button
                type="button"
                onclick={() => (typeSearchOpen = true)}
                class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium hover:bg-muted/80"
              >
                <Plus class="h-3 w-3" />
              </button>
            {/if}
          </div>
        </div>

        {#if displayAbilities?.length || editing}
          <div class="flex flex-wrap gap-2">
            {#each displayAbilities as ab, i (`${ab.ability.id}-${ab.slot.id}`)}
              <Badge variant="outline" class="rounded-full px-3 py-1">
                {#if editing && editor}
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
                {:else}
                  <a href={abilityUrl(ab.ability.id)} class="hover:underline">
                    {ab.ability.name}
                  </a>
                  {#if ab.slot.slug === 'hidden'}
                    <span class="ml-1 text-xs text-muted-foreground">(Hidden)</span>
                  {/if}
                {/if}
              </Badge>
            {/each}
            {#if editing && editor}
              <button
                type="button"
                onclick={() => (abilitySearchOpen = true)}
                class="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                <Plus class="h-3 w-3" />
                Add ability
              </button>
            {/if}
          </div>
        {/if}

        <div class="rounded-2xl border bg-background p-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-xs font-medium text-muted-foreground">Base stats</div>
            <div class="text-xs text-muted-foreground tabular-nums">
              Total {statTotal}
            </div>
          </div>
          <div class="space-y-2">
            {#each stats as stat (stat.label)}
              <div class="grid grid-cols-12 items-center gap-3">
                <div class="col-span-2 text-xs text-muted-foreground">{stat.label}</div>
                <div class={editing ? 'col-span-6' : 'col-span-8'}>
                  <Progress value={(clamp(stat.value, 0, 255) / 255) * 100} class="h-2" />
                </div>
                {#if editing && editor}
                  <div class="col-span-4">
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={String(stat.value)}
                      oninput={(e: Event) =>
                        editor.setBaseStat(stat.key, Number((e.target as HTMLInputElement).value))}
                      class="h-7 text-right text-xs tabular-nums"
                    />
                  </div>
                {:else}
                  <div class="col-span-2 text-right text-xs text-foreground tabular-nums">
                    {stat.value}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        {#if editing && editor}
          <textarea
            value={editor.speciesDescription ?? ''}
            oninput={(e: Event) => (editor.speciesDescription = (e.target as HTMLTextAreaElement).value || null)}
            class="w-full rounded-2xl border bg-background p-4 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder="Pokemon description"
          ></textarea>
        {:else if pokemon.description}
          <div class="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
            {pokemon.description}
          </div>
        {/if}
      </div>
    </div>
  </Card.Content>
</Card.Root>

{#if editing && editor}
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
{/if}
