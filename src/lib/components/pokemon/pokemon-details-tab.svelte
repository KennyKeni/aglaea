<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { MapPin, Droplets, Sparkles } from '@lucide/svelte';
  import type { Form, Pokemon, Spawn } from '$lib/types/pokemon';

  let {
    form,
    pokemon,
    loading = false,
  }: { form?: Form | null; pokemon?: Pokemon | null; loading?: boolean } = $props();

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
</script>

<div class="space-y-4">
  <Card.Root class="rounded-2xl">
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

  <Card.Root class="rounded-2xl">
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

  <Card.Root class="rounded-2xl">
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

  {#if form?.labels?.length}
    <Card.Root class="rounded-2xl">
      <Card.Header class="pb-3">
        <Card.Title class="flex items-center gap-2 text-base">
          <Sparkles class="h-4 w-4" />
          Labels
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-wrap gap-2">
          {#each form.labels as label (label.id)}
            <Badge variant="secondary" class="rounded-full">{label.name}</Badge>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  {/if}

  {#if form?.spawns?.length}
    <Card.Root class="rounded-2xl">
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
    <Card.Root class="rounded-2xl">
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
</div>
