<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { MapPin, X, Plus } from '@lucide/svelte';
  import type { Spawn } from '$lib/types/pokemon';

  let {
    spawns = $bindable<Spawn[]>([]),
  }: {
    spawns?: Spawn[];
  } = $props();

  function removeSpawn(index: number) {
    spawns = spawns.filter((_, i) => i !== index);
  }

  function updateSpawnField(index: number, field: string, value: string) {
    spawns = spawns.map((s, i) => {
      if (i !== index) return s;
      return { ...s, [field]: Number(value) || 0 };
    });
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

<Card.Root id="spawn-locations" class="rounded-2xl">
  <Card.Header>
    <Card.Title class="flex items-center gap-2 text-base">
      <MapPin class="h-4 w-4" />
      Spawn Locations
    </Card.Title>
  </Card.Header>
  <Card.Content class="space-y-3">
    {#each spawns as spawn, idx (spawn.id ?? idx)}
      {@const conditions = formatSpawnConditions(spawn)}
      <div class="rounded-xl bg-muted p-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <Badge variant="outline" class="rounded-full text-xs">{spawn.bucket.name}</Badge>
              <span class="text-xs text-muted-foreground">{spawn.positionType.name}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1">
                <span class="text-xs text-muted-foreground">Level</span>
                <Input
                  type="number"
                  min="1"
                  value={String(spawn.levelMin)}
                  oninput={(e: Event) => updateSpawnField(idx, 'levelMin', (e.target as HTMLInputElement).value)}
                  class="h-6 w-16 text-xs"
                />
                <span class="text-xs text-muted-foreground">–</span>
                <Input
                  type="number"
                  min="1"
                  value={String(spawn.levelMax)}
                  oninput={(e: Event) => updateSpawnField(idx, 'levelMax', (e.target as HTMLInputElement).value)}
                  class="h-6 w-16 text-xs"
                />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-xs text-muted-foreground">Weight</span>
                <Input
                  type="number"
                  min="0"
                  value={String(spawn.weight)}
                  oninput={(e: Event) => updateSpawnField(idx, 'weight', (e.target as HTMLInputElement).value)}
                  class="h-6 w-16 text-xs"
                />
              </div>
            </div>
            {#if conditions.length}
              <div class="flex flex-wrap gap-1">
                {#each conditions as cond}
                  <span class="rounded-full bg-background px-2 py-0.5 text-xs">{cond}</span>
                {/each}
              </div>
            {/if}
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 shrink-0"
            onclick={() => removeSpawn(idx)}
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
    {/each}
    {#if spawns.length === 0}
      <div class="text-sm text-muted-foreground">No spawn locations.</div>
    {/if}
  </Card.Content>
</Card.Root>
