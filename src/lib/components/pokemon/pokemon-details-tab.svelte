<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { MapPin, Droplets, Sparkles } from '@lucide/svelte';
  import type { Form, Pokemon, Spawn } from '$lib/types/pokemon';

  let {
    form,
    pokemon,
    loading = false,
  }: {
    form?: Form | null;
    pokemon?: Pokemon | null;
    loading?: boolean;
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

  // Resolve override values: form override takes precedence over species default
  const resolvedCatchRate = $derived(form?.overrides?.catchRate ?? pokemon?.catchRate ?? 0);
  const resolvedBaseFriendship = $derived(
    form?.overrides?.baseFriendship ?? pokemon?.baseFriendship ?? 0,
  );
  const resolvedEggCycles = $derived(form?.overrides?.eggCycles ?? pokemon?.eggCycles ?? 0);
  const resolvedMaleRatio = $derived.by(() => {
    if (form?.overrides?.maleRatio !== undefined) return form.overrides.maleRatio;
    return pokemon?.maleRatio ?? null;
  });
  const resolvedBaseScale = $derived.by(() => {
    if (form?.overrides?.baseScale !== undefined) return form.overrides.baseScale;
    return pokemon?.baseScale ?? null;
  });
  const skeletonCells = Array.from({ length: 6 }, (_, index) => index);
  const breedingSkeletonCells = Array.from({ length: 3 }, (_, index) => index);
</script>

<div class="space-y-8">
  <section id="training" class="space-y-3">
    <h2 class="text-base font-semibold">Training</h2>
    {#if loading || !form}
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(160px,100%),1fr))]">
        {#each skeletonCells as skeletonIndex (skeletonIndex)}
          <Skeleton class="h-16 w-full rounded-lg" />
        {/each}
      </div>
    {:else}
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(160px,100%),1fr))]">
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">EV Yield</div>
          <div class="mt-1 font-semibold">{getEvYield(form)}</div>
        </div>
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">Catch Rate</div>
          <div class="mt-1 font-semibold">{resolvedCatchRate}</div>
        </div>
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">Base Friendship</div>
          <div class="mt-1 font-semibold">{resolvedBaseFriendship}</div>
        </div>
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">Base Experience</div>
          <div class="mt-1 font-semibold">{form.baseExperienceYield ?? '—'}</div>
        </div>
        {#if pokemon?.experienceGroup}
          <div class="border-b border-border/50 pb-2">
            <div class="text-xs font-medium text-muted-foreground">Growth Rate</div>
            <div class="mt-1 font-semibold">{pokemon.experienceGroup.name}</div>
          </div>
        {/if}
      </div>
    {/if}
  </section>

  <section id="breeding" class="space-y-3">
    <h2 class="text-base font-semibold">Breeding</h2>
    {#if loading || !form}
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(160px,100%),1fr))]">
        {#each breedingSkeletonCells as skeletonIndex (skeletonIndex)}
          <Skeleton class="h-16 w-full rounded-lg" />
        {/each}
      </div>
    {:else}
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(160px,100%),1fr))]">
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">Egg Cycles</div>
          <div class="mt-1 font-semibold">{resolvedEggCycles}</div>
        </div>
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">Gender Ratio</div>
          <div class="mt-1 font-semibold">
            {#if resolvedMaleRatio === null}
              Genderless
            {:else}
              {(resolvedMaleRatio * 100).toFixed(0)}% M / {(
                (1 - resolvedMaleRatio) *
                100
              ).toFixed(0)}% F
            {/if}
          </div>
        </div>
        {#if pokemon?.eggGroups?.length}
          <div class="border-b border-border/50 pb-2">
            <div class="text-xs font-medium text-muted-foreground">Egg Groups</div>
            <div class="mt-1 font-semibold">
              {pokemon.eggGroups.map((g) => g.name).join(', ')}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </section>

  <section id="physical" class="space-y-3">
    <h2 class="text-base font-semibold">Physical</h2>
    {#if loading || !form}
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(160px,100%),1fr))]">
        {#each breedingSkeletonCells as skeletonIndex (skeletonIndex)}
          <Skeleton class="h-16 w-full rounded-lg" />
        {/each}
      </div>
    {:else}
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(160px,100%),1fr))]">
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">Height</div>
          <div class="mt-1 font-semibold">{(form.height / 10).toFixed(1)}m</div>
        </div>
        <div class="border-b border-border/50 pb-2">
          <div class="text-xs font-medium text-muted-foreground">Weight</div>
          <div class="mt-1 font-semibold">{(form.weight / 10).toFixed(1)}kg</div>
        </div>
        {#if resolvedBaseScale}
          <div class="border-b border-border/50 pb-2">
            <div class="text-xs font-medium text-muted-foreground">Base Scale</div>
            <div class="mt-1 font-semibold">{resolvedBaseScale.toFixed(2)}x</div>
          </div>
        {/if}
      </div>
    {/if}
  </section>

  {#if form?.labels?.length}
    <section id="labels" class="space-y-3">
      <h2 class="flex items-center gap-2 text-base font-semibold">
        <Sparkles class="h-4 w-4" />
        Labels
      </h2>
      <div class="flex flex-wrap gap-2">
        {#each form.labels as label (label.id)}
          <Badge variant="secondary" class="rounded-full">
            {label.name}
          </Badge>
        {/each}
      </div>
    </section>
  {/if}

  {#if form?.spawns?.length}
    <section id="spawn-locations" class="space-y-3">
      <h2 class="flex items-center gap-2 text-base font-semibold">
        <MapPin class="h-4 w-4" />
        Spawn Locations
      </h2>
      <div class="space-y-3">
        {#each form.spawns as spawn (spawn.id)}
          {@const conditions = formatSpawnConditions(spawn)}
          <div class="rounded-lg bg-muted/50 p-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="rounded-full text-xs">{spawn.bucket.name}</Badge>
                <span class="text-xs text-muted-foreground">{spawn.positionType.name}</span>
              </div>
              <span class="text-sm font-medium">Lv. {spawn.levelMin}–{spawn.levelMax}</span>
            </div>
            {#if conditions.length}
              <div class="mt-2 flex flex-wrap gap-1">
                {#each conditions as cond (cond)}
                  <span class="rounded-full bg-background px-2 py-0.5 text-xs">{cond}</span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if form?.drops && (form.drops.percentages.length || form.drops.ranges.length)}
    <section id="drops" class="space-y-3">
      <h2 class="flex items-center gap-2 text-base font-semibold">
        <Droplets class="h-4 w-4" />
        Drops
      </h2>
      <p class="text-xs text-muted-foreground">Drops {form.drops.amount} item(s) when defeated</p>
      <div class="space-y-2">
        {#each form.drops.percentages as drop, i (`percentage-${i}-${drop.item.id}`)}
          <div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span class="font-medium">{drop.item.name}</span>
            <span class="text-sm text-muted-foreground">{drop.percentage}%</span>
          </div>
        {/each}
        {#each form.drops.ranges as drop, i (`range-${i}-${drop.item.id}`)}
          <div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span class="font-medium">{drop.item.name}</span>
            <span class="text-sm text-muted-foreground">
              {drop.quantityMin}–{drop.quantityMax}
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
