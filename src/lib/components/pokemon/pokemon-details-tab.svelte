<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Button } from '$lib/components/ui/button';
  import { MapPin, Droplets, Sparkles, X, Plus } from '@lucide/svelte';
  import type { Form, Pokemon, Spawn, Drops } from '$lib/types/pokemon';
  import SpawnsEditor from './spawns-editor.svelte';
  import DropsEditor from './drops-editor.svelte';
  import type { PokemonFormEditor } from '$lib/state/pokemon-form-editor.svelte';

  let {
    form,
    pokemon,
    loading = false,
    editing = false,
    editor,
  }: {
    form?: Form | null;
    pokemon?: Pokemon | null;
    loading?: boolean;
    editing?: boolean;
    editor?: PokemonFormEditor;
  } = $props();

  function getEvYield(form: Form): string {
    const evs: string[] = [];
    if (form.evHp) evs.push(`${form.evHp} HP`);
    if (form.evAttack) evs.push(`${form.evAttack} Atk`);
    if (form.evDefence) evs.push(`${form.evDefence} Def`);
    if (form.evSpecialAttack) evs.push(`${form.evSpecialAttack} SpA`);
    if (form.evSpecialDefence) evs.push(`${form.evSpecialDefence} SpD`);
    if (form.evSpeed) evs.push(`${form.evSpeed} Spe`);
    return evs.length ? evs.join(', ') : 'None';
  }

  function formatSpawnConditions(spawn: Spawn): string[] {
    const parts: string[] = [];
    for (const cond of spawn.conditions) {
      if (cond.biomeTags?.length) {
        parts.push(...cond.biomeTags.map((t) => t.name.replace('Is ', '')));
      }
      if (cond.biomes?.length) {
        parts.push(...cond.biomes.map((b) => b.name));
      }
      if (cond.timeRanges?.length) {
        parts.push(...cond.timeRanges.map((t) => t.name));
      }
    }
    return parts;
  }

  function handleNumberInput(setter: (v: number) => void) {
    return (e: Event) => {
      setter(Number((e.target as HTMLInputElement).value) || 0);
    };
  }

  const displayLabels = $derived(editing && editor ? editor.formLabels : form?.labels ?? []);
  const displaySpawns = $derived(editing && editor ? editor.formSpawns : form?.spawns ?? []);
  const displayDrops = $derived(editing && editor ? editor.formDrops : form?.drops ?? null);
</script>

<div class="space-y-4">
  <Card.Root id="training" class="rounded-2xl">
    <Card.Header class="pb-3">
      <Card.Title class="text-base">Training</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if loading || !form}
        <div class="grid gap-3 sm:grid-cols-2">
          {#each Array(6) as _, i (i)}
            <Skeleton class="h-16 w-full rounded-xl" />
          {/each}
        </div>
      {:else if editing && editor}
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">EV Yield</div>
            <div class="mt-1 grid grid-cols-2 gap-2">
              <div>
                <span class="text-xs text-muted-foreground">HP</span>
                <Input type="number" min="0" max="3" value={String(editor.evs.hp)} oninput={handleNumberInput((v) => editor.setEv('hp', v))} class="h-7 text-xs" />
              </div>
              <div>
                <span class="text-xs text-muted-foreground">Atk</span>
                <Input type="number" min="0" max="3" value={String(editor.evs.attack)} oninput={handleNumberInput((v) => editor.setEv('attack', v))} class="h-7 text-xs" />
              </div>
              <div>
                <span class="text-xs text-muted-foreground">Def</span>
                <Input type="number" min="0" max="3" value={String(editor.evs.defence)} oninput={handleNumberInput((v) => editor.setEv('defence', v))} class="h-7 text-xs" />
              </div>
              <div>
                <span class="text-xs text-muted-foreground">SpA</span>
                <Input type="number" min="0" max="3" value={String(editor.evs.specialAttack)} oninput={handleNumberInput((v) => editor.setEv('specialAttack', v))} class="h-7 text-xs" />
              </div>
              <div>
                <span class="text-xs text-muted-foreground">SpD</span>
                <Input type="number" min="0" max="3" value={String(editor.evs.specialDefence)} oninput={handleNumberInput((v) => editor.setEv('specialDefence', v))} class="h-7 text-xs" />
              </div>
              <div>
                <span class="text-xs text-muted-foreground">Spe</span>
                <Input type="number" min="0" max="3" value={String(editor.evs.speed)} oninput={handleNumberInput((v) => editor.setEv('speed', v))} class="h-7 text-xs" />
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Catch Rate</div>
            <div class="mt-1">
              <Input type="number" min="0" max="255" value={String(editor.catchRate)} oninput={handleNumberInput((v) => (editor.catchRate = v))} class="h-8 font-semibold" />
            </div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Base Friendship</div>
            <div class="mt-1">
              <Input type="number" min="0" max="255" value={String(editor.baseFriendship)} oninput={handleNumberInput((v) => (editor.baseFriendship = v))} class="h-8 font-semibold" />
            </div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Base Experience</div>
            <div class="mt-1">
              <Input
                type="number"
                min="0"
                value={String(editor.baseExperienceYield ?? '')}
                oninput={(e: Event) => {
                  const val = (e.target as HTMLInputElement).value;
                  editor.baseExperienceYield = val ? Number(val) : null;
                }}
                class="h-8 font-semibold"
                placeholder="—"
              />
            </div>
          </div>
        </div>
      {:else}
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">EV Yield</div>
            <div class="mt-1 font-semibold">{getEvYield(form)}</div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Catch Rate</div>
            <div class="mt-1 font-semibold">{form.catchRate}</div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Base Friendship</div>
            <div class="mt-1 font-semibold">{form.baseFriendship}</div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Base Experience</div>
            <div class="mt-1 font-semibold">{form.baseExperienceYield ?? '—'}</div>
          </div>
          {#if pokemon?.experienceGroup}
            <div class="rounded-xl bg-muted p-3">
              <div class="text-xs font-medium text-muted-foreground">Growth Rate</div>
              <div class="mt-1 font-semibold">{pokemon.experienceGroup.name}</div>
            </div>
          {/if}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root id="breeding" class="rounded-2xl">
    <Card.Header class="pb-3">
      <Card.Title class="text-base">Breeding</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if loading || !form}
        <div class="grid gap-3 sm:grid-cols-2">
          {#each Array(3) as _, i (i)}
            <Skeleton class="h-16 w-full rounded-xl" />
          {/each}
        </div>
      {:else if editing && editor}
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Egg Cycles</div>
            <div class="mt-1">
              <Input type="number" min="0" value={String(editor.eggCycles)} oninput={handleNumberInput((v) => (editor.eggCycles = v))} class="h-8 font-semibold" />
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
                oninput={(e: Event) => {
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
                  onchange={(e: Event) => {
                    editor.maleRatio = (e.target as HTMLInputElement).checked ? null : 0.5;
                  }}
                />
                Genderless
              </label>
            </div>
          </div>
        </div>
      {:else}
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Egg Cycles</div>
            <div class="mt-1 font-semibold">{form.eggCycles}</div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Gender Ratio</div>
            <div class="mt-1 font-semibold">
              {#if form.maleRatio === null}
                Genderless
              {:else}
                {(form.maleRatio * 100).toFixed(0)}% M / {((1 - form.maleRatio) * 100).toFixed(0)}%
                F
              {/if}
            </div>
          </div>
          {#if pokemon?.eggGroups?.length}
            <div class="rounded-xl bg-muted p-3">
              <div class="text-xs font-medium text-muted-foreground">Egg Groups</div>
              <div class="mt-1 font-semibold">
                {pokemon.eggGroups.map((g) => g.name).join(', ')}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root id="physical" class="rounded-2xl">
    <Card.Header class="pb-3">
      <Card.Title class="text-base">Physical</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if loading || !form}
        <div class="grid gap-3 sm:grid-cols-3">
          {#each Array(3) as _, i (i)}
            <Skeleton class="h-16 w-full rounded-xl" />
          {/each}
        </div>
      {:else if editing && editor}
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Height (dm)</div>
            <div class="mt-1">
              <Input type="number" min="0" value={String(editor.height)} oninput={handleNumberInput((v) => (editor.height = v))} class="h-8 font-semibold" />
            </div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Weight (hg)</div>
            <div class="mt-1">
              <Input type="number" min="0" value={String(editor.weight)} oninput={handleNumberInput((v) => (editor.weight = v))} class="h-8 font-semibold" />
            </div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Base Scale</div>
            <div class="mt-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editor.baseScale !== null ? String(editor.baseScale) : ''}
                oninput={(e: Event) => {
                  const val = (e.target as HTMLInputElement).value;
                  editor.baseScale = val ? Number(val) : null;
                }}
                class="h-8 font-semibold"
                placeholder="—"
              />
            </div>
          </div>
        </div>
      {:else}
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Height</div>
            <div class="mt-1 font-semibold">{(form.height / 10).toFixed(1)}m</div>
          </div>
          <div class="rounded-xl bg-muted p-3">
            <div class="text-xs font-medium text-muted-foreground">Weight</div>
            <div class="mt-1 font-semibold">{(form.weight / 10).toFixed(1)}kg</div>
          </div>
          {#if form.baseScale}
            <div class="rounded-xl bg-muted p-3">
              <div class="text-xs font-medium text-muted-foreground">Base Scale</div>
              <div class="mt-1 font-semibold">{form.baseScale.toFixed(2)}x</div>
            </div>
          {/if}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  {#if (editing && editor) || displayLabels.length}
    <Card.Root id="labels" class="rounded-2xl">
      <Card.Header class="pb-3">
        <Card.Title class="flex items-center gap-2 text-base">
          <Sparkles class="h-4 w-4" />
          Labels
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-wrap gap-2">
          {#each displayLabels as label, i (label.id)}
            <Badge variant="secondary" class="rounded-full">
              {label.name}
              {#if editing && editor}
                <button
                  type="button"
                  onclick={() => editor.removeLabel(i)}
                  class="ml-1 rounded-full hover:bg-muted"
                >
                  <X class="h-3 w-3" />
                </button>
              {/if}
            </Badge>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  {/if}

  {#if editing && editor}
    <SpawnsEditor bind:spawns={editor.formSpawns} />
    <DropsEditor bind:drops={editor.formDrops} />
  {:else}
    {#if form?.spawns?.length}
      <Card.Root id="spawn-locations" class="rounded-2xl">
        <Card.Header class="pb-3">
          <Card.Title class="flex items-center gap-2 text-base">
            <MapPin class="h-4 w-4" />
            Spawn Locations
          </Card.Title>
        </Card.Header>
        <Card.Content class="space-y-3">
          {#each form.spawns as spawn (spawn.id)}
            {@const conditions = formatSpawnConditions(spawn)}
            <div class="rounded-xl bg-muted p-3">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <Badge variant="outline" class="rounded-full text-xs">{spawn.bucket.name}</Badge>
                  <span class="text-xs text-muted-foreground">{spawn.positionType.name}</span>
                </div>
                <span class="text-sm font-medium">Lv. {spawn.levelMin}–{spawn.levelMax}</span>
              </div>
              {#if conditions.length}
                <div class="mt-2 flex flex-wrap gap-1">
                  {#each conditions as cond}
                    <span class="rounded-full bg-background px-2 py-0.5 text-xs">{cond}</span>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    {/if}

    {#if form?.drops && (form.drops.percentages.length || form.drops.ranges.length)}
      <Card.Root id="drops" class="rounded-2xl">
        <Card.Header class="pb-3">
          <Card.Title class="flex items-center gap-2 text-base">
            <Droplets class="h-4 w-4" />
            Drops
          </Card.Title>
          <p class="text-xs text-muted-foreground">Drops {form.drops.amount} item(s) when defeated</p>
        </Card.Header>
        <Card.Content>
          <div class="space-y-2">
            {#each form.drops.percentages as drop, i (`percentage-${i}-${drop.item.id}`)}
              <div class="flex items-center justify-between rounded-xl bg-muted p-3">
                <span class="font-medium">{drop.item.name}</span>
                <span class="text-sm text-muted-foreground">{drop.percentage}%</span>
              </div>
            {/each}
            {#each form.drops.ranges as drop, i (`range-${i}-${drop.item.id}`)}
              <div class="flex items-center justify-between rounded-xl bg-muted p-3">
                <span class="font-medium">{drop.item.name}</span>
                <span class="text-sm text-muted-foreground">
                  {drop.quantityMin}–{drop.quantityMax}
                </span>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    {/if}
  {/if}
</div>
