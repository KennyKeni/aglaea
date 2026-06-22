<script lang="ts">
  import { cn } from '$lib/utils';
  import { TYPE_COLORS } from '$lib/utils/pokemon';
  import type { Move } from '$lib/types/move';
  import { pokemonUrl } from '$lib/utils/url';

  let { move }: { move: Move } = $props();

  function formatAccuracy(accuracy: Move['accuracy']) {
    if (accuracy === true) return 'Always';
    if (accuracy === false) return 'Never';
    if (accuracy == null) return '—';
    return `${accuracy}%`;
  }
</script>

<div class="space-y-8">
  <!-- Overview -->
  <section id="overview" class="space-y-3">
    <h2 class="text-lg font-semibold">Overview</h2>
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <span
          class={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
            TYPE_COLORS[move.type.slug] || 'bg-muted',
          )}
        >
          {move.type.name}
        </span>
        <span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
          {move.category.name}
        </span>
        {#if move.target}
          <span
            class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium"
          >
            {move.target.name}
          </span>
        {/if}
      </div>

      {#if move.desc}
        <p class="text-sm text-muted-foreground">{move.desc}</p>
      {/if}

      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(140px,100%),1fr))]">
        <div>
          <div class="text-xs text-muted-foreground">Power</div>
          <div class="text-lg font-semibold">{move.power ?? '—'}</div>
        </div>
        <div>
          <div class="text-xs text-muted-foreground">Accuracy</div>
          <div class="text-lg font-semibold">{formatAccuracy(move.accuracy)}</div>
        </div>
        <div>
          <div class="text-xs text-muted-foreground">PP</div>
          <div class="text-lg font-semibold">{move.pp}</div>
        </div>
        <div>
          <div class="text-xs text-muted-foreground">Priority</div>
          <div class="text-lg font-semibold">{move.priority}</div>
        </div>
      </div>

      {#if move.critRatio || move.minHits || move.drainPercent || move.healPercent || move.recoilPercent}
        <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(140px,100%),1fr))]">
          {#if move.critRatio}
            <div>
              <div class="text-xs text-muted-foreground">Crit Ratio</div>
              <div class="font-semibold">{move.critRatio}</div>
            </div>
          {/if}
          {#if move.minHits}
            <div>
              <div class="text-xs text-muted-foreground">Hits</div>
              <div class="font-semibold">
                {move.minHits}{move.maxHits && move.maxHits !== move.minHits
                  ? `–${move.maxHits}`
                  : ''}
              </div>
            </div>
          {/if}
          {#if move.drainPercent}
            <div>
              <div class="text-xs text-muted-foreground">Drain</div>
              <div class="font-semibold">{move.drainPercent}%</div>
            </div>
          {/if}
          {#if move.healPercent}
            <div>
              <div class="text-xs text-muted-foreground">Heal</div>
              <div class="font-semibold">{move.healPercent}%</div>
            </div>
          {/if}
          {#if move.recoilPercent}
            <div>
              <div class="text-xs text-muted-foreground">Recoil</div>
              <div class="font-semibold">{move.recoilPercent}%</div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </section>

  <!-- Flags -->
  {#if move.flags.length > 0}
    <section id="flags" class="space-y-3">
      <h2 class="text-lg font-semibold">Flags</h2>
      <div class="space-y-2">
        {#each move.flags as flag (flag.id)}
          <div>
            <span class="font-medium">{flag.name}</span>
            {#if flag.description}
              <span class="text-sm text-muted-foreground"> — {flag.description}</span>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Boosts -->
  {#if move.boosts.length > 0}
    <section id="boosts" class="space-y-3">
      <h2 class="text-lg font-semibold">Stat Changes</h2>
      <div class="space-y-2">
        {#each move.boosts as boost (`${boost.stat.slug}-${boost.isSelf}-${boost.stages}`)}
          <div class="flex items-center gap-2">
            <span class="font-medium">{boost.stat.name}</span>
            <span
              class={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                boost.stages > 0
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              )}
            >
              {boost.stages > 0 ? '+' : ''}{boost.stages}
            </span>
            <span class="text-xs text-muted-foreground">
              ({boost.isSelf ? 'Self' : 'Target'})
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Effects -->
  {#if move.effects.length > 0}
    <section id="effects" class="space-y-3">
      <h2 class="text-lg font-semibold">Effects</h2>
      <div class="space-y-2">
        {#each move.effects as effect (`${effect.condition?.slug ?? effect.conditionType.slug}-${effect.isSelf}-${effect.chance}`)}
          <div>
            <span class="font-medium">
              {effect.condition?.name ?? effect.conditionType.name}
            </span>
            {#if effect.chance > 0 && effect.chance < 100}
              <span class="text-sm text-muted-foreground">({effect.chance}% chance)</span>
            {/if}
            <span class="text-xs text-muted-foreground">
              ({effect.isSelf ? 'Self' : 'Target'})
            </span>
            {#if effect.condition?.description}
              <p class="text-sm text-muted-foreground">{effect.condition.description}</p>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Z-Move Data -->
  {#if move.zData}
    <section id="z-data" class="space-y-3">
      <h2 class="text-lg font-semibold">Z-Move Data</h2>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(140px,100%),1fr))]">
        {#if move.zData.zPower}
          <div>
            <div class="text-xs text-muted-foreground">Z-Power</div>
            <div class="font-semibold">{move.zData.zPower}</div>
          </div>
        {/if}
        {#if move.zData.zEffect}
          <div>
            <div class="text-xs text-muted-foreground">Z-Effect</div>
            <div class="font-semibold">{move.zData.zEffect}</div>
          </div>
        {/if}
        {#if move.zData.zCrystal}
          <div>
            <div class="text-xs text-muted-foreground">Z-Crystal</div>
            <div class="font-semibold">{move.zData.zCrystal}</div>
          </div>
        {/if}
        <div>
          <div class="text-xs text-muted-foreground">Z-Exclusive</div>
          <div class="font-semibold">{move.zData.isZExclusive ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </section>
  {/if}

  <!-- G-Max Species -->
  {#if move.gmaxSpecies.length > 0}
    <section id="gmax-species" class="space-y-3">
      <h2 class="text-lg font-semibold">G-Max Species</h2>
      <div class="flex flex-wrap gap-2">
        {#each move.gmaxSpecies as species (species.id)}
          <a
            href={pokemonUrl(species.id)}
            class="rounded-full bg-muted px-3 py-1 text-sm font-medium hover:bg-muted/80"
          >
            {species.name}
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Forms -->
  {#if move.forms.length > 0}
    <section id="forms" class="space-y-3">
      <h2 class="text-lg font-semibold">Forms</h2>
      <div class="divide-y divide-border">
        {#each move.forms as form (form.id)}
          <div class="py-3 first:pt-0 last:pb-0">
            <a href={pokemonUrl(form.speciesId, form.id)} class="font-medium hover:underline">
              {form.name}
            </a>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
