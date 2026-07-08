<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Bike, Box, Brain, Droplets, MapPin, Sparkles, Sun } from '@lucide/svelte';
  import type { Form, Pokemon, Spawn } from '$lib/types/pokemon';
  import {
    detailRidingData,
    resolveRiding,
    summarizeBehaviourData,
    summarizeRidingData,
  } from '$lib/utils/pokemon-detail';

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

  function titleish(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function formatRange(label: string, min: number | null, max: number | null): string | null {
    if (min === null && max === null) return null;
    if (min !== null && max !== null) return `${label} ${min}-${max}`;
    if (min !== null) return `${label} ${min}+`;
    return `${label} <=${max}`;
  }

  function formatSpawnConditions(spawn: Spawn): string[] {
    const parts: string[] = [];
    for (const cond of spawn.conditions) {
      if (cond.type) {
        parts.push(titleish(cond.type));
      }
      if (cond.multiplier !== null && cond.multiplier !== undefined) {
        parts.push(`x${cond.multiplier}`);
      }
      if (cond.biomeTags?.length) {
        parts.push(...cond.biomeTags.map((t) => t.name.replace('Is ', '')));
      }
      if (cond.biomes?.length) {
        parts.push(...cond.biomes.map((b) => b.name));
      }
      if (cond.timeRanges?.length) {
        parts.push(...cond.timeRanges.map((t) => t.name));
      }
      if (cond.moonPhases?.length) {
        parts.push(...cond.moonPhases.map((m) => m.name));
      }
      if (cond.weather) {
        if (cond.weather.isRaining === true) parts.push('Rain');
        if (cond.weather.isRaining === false) parts.push('No rain');
        if (cond.weather.isThundering === true) parts.push('Thunder');
        if (cond.weather.isThundering === false) parts.push('No thunder');
      }
      if (cond.sky) {
        if (cond.sky.canSeeSky === true) parts.push('Can see sky');
        if (cond.sky.canSeeSky === false) parts.push('No sky view');
        const skyLight = formatRange('Sky', cond.sky.minSkyLight, cond.sky.maxSkyLight);
        if (skyLight) parts.push(skyLight);
      }
      if (cond.position) {
        const yRange = formatRange('Y', cond.position.minY, cond.position.maxY);
        if (yRange) parts.push(yRange);
      }
      if (cond.lure) {
        const lureRange = formatRange('Lure', cond.lure.minLureLevel, cond.lure.maxLureLevel);
        if (lureRange) parts.push(lureRange);
      }
    }
    return parts;
  }

  function formatGlowMode(mode: string | null): string {
    if (mode === 'land') return 'Land glow';
    if (mode === 'underwater') return 'Underwater glow';
    if (mode === 'both') return 'Land and underwater glow';
    return 'No liquid glow';
  }

  function formatNullableFlag(value: boolean | null): string {
    if (value === null) return 'Unspecified';
    return value ? 'Yes' : 'No';
  }

  function hasGameplayVisuals(form: Form | null | undefined, pokemon: Pokemon | null | undefined) {
    return Boolean(
      form?.hitbox ||
      form?.lighting ||
      form?.riding ||
      pokemon?.lighting ||
      pokemon?.riding ||
      pokemon?.gameplay ||
      form?.gameplay ||
      form?.aspectChoices.length ||
      form?.behaviour,
    );
  }

  const resolvedRiding = $derived(resolveRiding(form, pokemon));
  const ridingSummary = $derived(resolvedRiding ? summarizeRidingData(resolvedRiding.data) : null);
  const ridingDetails = $derived(resolvedRiding ? detailRidingData(resolvedRiding.data) : null);
  const behaviourSummary = $derived(
    form?.behaviour ? summarizeBehaviourData(form.behaviour.data) : null,
  );

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
  const visualSkeletonCells = Array.from({ length: 4 }, (_, index) => index);
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
              {(resolvedMaleRatio * 100).toFixed(0)}% M / {((1 - resolvedMaleRatio) * 100).toFixed(
                0,
              )}% F
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

  {#if loading}
    <section id="gameplay-visuals" class="space-y-3">
      <h2 class="text-base font-semibold">Gameplay & Visuals</h2>
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))]">
        {#each visualSkeletonCells as skeletonIndex (skeletonIndex)}
          <Skeleton class="h-20 w-full rounded-lg" />
        {/each}
      </div>
    </section>
  {:else if form && hasGameplayVisuals(form, pokemon)}
    <section id="gameplay-visuals" class="space-y-3">
      <h2 class="flex items-center gap-2 text-base font-semibold">
        <Sparkles class="h-4 w-4" />
        Gameplay & Visuals
      </h2>
      <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))]">
        {#if form.hitbox}
          <div class="border-b border-border/50 pb-2">
            <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Box class="h-3.5 w-3.5" />
              Hitbox
            </div>
            <div class="mt-1 font-semibold">
              {form.hitbox.width.toFixed(1)}w x {form.hitbox.height.toFixed(1)}h
            </div>
            <div class="mt-0.5 text-xs text-muted-foreground">
              {form.hitbox.fixed ? 'Fixed size' : 'Dynamic size'}
            </div>
          </div>
        {/if}

        {#if form.lighting ?? pokemon?.lighting}
          {@const lighting = form.lighting ?? pokemon?.lighting}
          <div class="border-b border-border/50 pb-2">
            <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sun class="h-3.5 w-3.5" />
              {form.lighting ? 'Form Lighting' : 'Species Lighting'}
            </div>
            {#if lighting}
              <div class="mt-1 font-semibold">Light {lighting.lightLevel}</div>
              <div class="mt-0.5 text-xs text-muted-foreground">
                {formatGlowMode(lighting.liquidGlowMode)}
              </div>
            {/if}
          </div>
        {/if}

        {#if resolvedRiding}
          {@const isFormRiding = resolvedRiding.source === 'form'}
          <div class="border-b border-border/50 pb-2">
            <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Bike class="h-3.5 w-3.5" />
              {isFormRiding ? 'Form Riding profile' : 'Species Riding profile'}
            </div>
            {#if ridingSummary}
              {#if ridingSummary.rideStyles?.length}
                <div class="mt-1 font-semibold">{ridingSummary.rideStyles.join(', ')}</div>
              {/if}
              {#if ridingSummary.behaviourKeys?.length}
                <div class="mt-0.5 text-xs text-muted-foreground">
                  {ridingSummary.behaviourKeys.join(', ')}
                </div>
              {/if}
              {#if ridingSummary.seatCount !== null}
                <div class="mt-0.5 text-xs text-muted-foreground">
                  Seats {ridingSummary.seatCount}
                </div>
              {/if}
              {#if ridingSummary.stats}
                {#each Object.entries(ridingSummary.stats) as [key, value] (`ride-stat-${key}`)}
                  <div class="mt-0.5 text-xs text-muted-foreground">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {value}
                  </div>
                {/each}
              {/if}
              {#if ridingSummary.settingProfiles?.length}
                <div class="mt-0.5 text-xs text-muted-foreground">
                  {ridingSummary.settingProfiles.join(', ')}
                </div>
              {/if}
              {#if ridingSummary.rideSoundCount !== null}
                <div class="mt-0.5 text-xs text-muted-foreground">
                  {ridingSummary.rideSoundCount} ride sound{ridingSummary.rideSoundCount === 1
                    ? ''
                    : 's'}
                </div>
              {/if}
              {#if ridingSummary.inheritance}
                <div class="mt-0.5 text-xs text-muted-foreground">{ridingSummary.inheritance}</div>
              {/if}
              {#if !ridingSummary.rideStyles?.length && !ridingSummary.behaviourKeys?.length && ridingSummary.seatCount === null && !ridingSummary.stats && !ridingSummary.settingProfiles?.length && ridingSummary.rideSoundCount === null && !ridingSummary.inheritance}
                <div class="mt-1 font-semibold">Available</div>
              {/if}
            {:else}
              <div class="mt-1 font-semibold">Available</div>
            {/if}
          </div>
        {/if}

        {#if pokemon?.gameplay}
          <div class="border-b border-border/50 pb-2">
            <div class="text-xs font-medium text-muted-foreground">Species Gameplay</div>
            <div class="mt-1 font-semibold">
              Dynamax blocked: {formatNullableFlag(pokemon.gameplay.dynamaxBlocked)}
            </div>
            <div class="mt-0.5 text-xs text-muted-foreground">
              Battle only: {formatNullableFlag(pokemon.gameplay.battleOnly)}
            </div>
          </div>
        {/if}

        {#if form.gameplay}
          <div class="border-b border-border/50 pb-2">
            <div class="text-xs font-medium text-muted-foreground">Form Gameplay</div>
            <div class="mt-1 font-semibold">
              Dynamax blocked: {formatNullableFlag(form.gameplay.dynamaxBlocked)}
            </div>
          </div>
        {/if}

        {#if form.aspectChoices.length}
          <div class="border-b border-border/50 pb-2">
            <div class="text-xs font-medium text-muted-foreground">Aspects</div>
            <div class="mt-2 flex flex-wrap gap-1">
              {#each form.aspectChoices as aspect (aspect.id)}
                <Badge variant="outline" class="rounded-full text-xs">{aspect.name}</Badge>
              {/each}
            </div>
          </div>
        {/if}

        {#if form.behaviour}
          <div class="border-b border-border/50 pb-2">
            <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Brain class="h-3.5 w-3.5" />
              Behaviour profile
            </div>
            {#if behaviourSummary && (behaviourSummary.facts.length || behaviourSummary.inheritance)}
              {#if behaviourSummary.facts.length}
                {#each behaviourSummary.facts as fact, index (`behaviour-fact-${index}-${fact}`)}
                  <div
                    class={index === 0
                      ? 'mt-1 font-semibold'
                      : 'mt-0.5 text-xs text-muted-foreground'}
                  >
                    {fact}
                  </div>
                {/each}
              {/if}
              {#if behaviourSummary.inheritance}
                <div class="mt-0.5 text-xs text-muted-foreground">
                  {behaviourSummary.inheritance}
                </div>
              {/if}
            {:else}
              <div class="mt-1 font-semibold">Available</div>
            {/if}
          </div>
        {/if}
      </div>
    </section>

    {#if ridingDetails}
      <section id="riding-details" class="space-y-3">
        <h2 class="flex items-center gap-2 text-base font-semibold">
          <Bike class="h-4 w-4" />
          Riding Details
        </h2>
        <div class="space-y-4">
          {#each ridingDetails.behaviours as behaviour, behaviourIndex (`riding-behaviour-${behaviourIndex}-${behaviour.style ?? 'style'}-${behaviour.key ?? 'key'}`)}
            <div class="min-w-0 space-y-1 border-b border-border/50 pb-3">
              {#if behaviour.style}
                <div class="font-semibold">{behaviour.style}</div>
              {/if}
              {#if behaviour.key}
                <div class="break-words text-xs text-muted-foreground">{behaviour.key}</div>
              {/if}
              {#if behaviour.compositeRole}
                <div class="text-xs text-muted-foreground">{behaviour.compositeRole}</div>
              {/if}
              {#if behaviour.transitionStrategy}
                <div class="text-xs text-muted-foreground">{behaviour.transitionStrategy}</div>
              {/if}
              {#each behaviour.stats as stat, statIndex (`riding-stat-${behaviourIndex}-${statIndex}-${stat.label}`)}
                <div class="text-xs text-muted-foreground">{stat.label}</div>
                {#if stat.description}
                  <div class="text-xs text-muted-foreground">{stat.description}</div>
                {/if}
              {/each}
              {#each behaviour.values as value, valueIndex (`riding-value-${behaviourIndex}-${valueIndex}-${value}`)}
                <div class="break-words text-xs text-muted-foreground">{value}</div>
              {/each}
              {#if behaviour.settingProfile}
                {#if behaviour.settingProfile.label}
                  <div class="text-xs text-muted-foreground">{behaviour.settingProfile.label}</div>
                {/if}
                {#if behaviour.settingProfile.resource}
                  <div class="break-words text-xs text-muted-foreground">
                    {behaviour.settingProfile.resource}
                  </div>
                {/if}
                {#each behaviour.settingProfile.values as settingValue, settingIndex (`riding-setting-${behaviourIndex}-${settingIndex}-${settingValue}`)}
                  <div class="break-words text-xs text-muted-foreground">{settingValue}</div>
                {/each}
              {/if}
              {#each behaviour.rideSounds as sound, soundIndex (`riding-sound-${behaviourIndex}-${soundIndex}-${sound.location}`)}
                <div class="break-words text-xs text-muted-foreground">{sound.location}</div>
                {#each sound.facts as fact, factIndex (`riding-sound-fact-${behaviourIndex}-${soundIndex}-${factIndex}-${fact}`)}
                  <div class="break-words text-xs text-muted-foreground">{fact}</div>
                {/each}
              {/each}
              {#if behaviour.inheritance}
                <div class="text-xs text-muted-foreground">{behaviour.inheritance}</div>
              {/if}
            </div>
          {/each}

          {#each ridingDetails.seats as seat, seatIndex (`riding-seat-${seatIndex}-${seat.label}`)}
            <div class="min-w-0 space-y-1 border-b border-border/50 pb-3">
              <div class="font-semibold">{seat.label}</div>
              {#if seat.offset}
                <div class="break-words text-xs text-muted-foreground">{seat.offset}</div>
              {/if}
              {#each seat.poseOffsets as poseOffset, poseIndex (`riding-pose-${seatIndex}-${poseIndex}-${poseOffset}`)}
                <div class="break-words text-xs text-muted-foreground">{poseOffset}</div>
              {/each}
            </div>
          {/each}
        </div>
      </section>
    {/if}
  {/if}

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
            {#if spawn.weight !== null && spawn.weight !== undefined}
              <div class="mt-1 text-xs text-muted-foreground">Weight {spawn.weight}</div>
            {/if}
            {#if conditions.length}
              <div class="mt-2 flex flex-wrap gap-1">
                {#each conditions as cond, index (`spawn-${spawn.id}-condition-${index}-${cond}`)}
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
              {drop.percentage}% · {drop.quantityMin}–{drop.quantityMax}
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
