<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import type { FormMove } from '$lib/types/pokemon';
  import { moveUrl } from '$lib/utils/url';

  let { moves = [], loading = false }: { moves?: FormMove[]; loading?: boolean } = $props();
</script>

<Card.Root id="moves" class="rounded-2xl">
  <Card.Header class="pb-3">
    <div>
      <Card.Title class="text-base">Moves</Card.Title>
      <div class="mt-1 text-sm text-muted-foreground">
        {#if loading}
          Loading moves...
        {:else}
          Showing {moves.length} moves for this form
        {/if}
      </div>
    </div>
  </Card.Header>
  <Card.Content>
    <div class="space-y-2">
      {#if loading}
        {#each Array(6) as _, i (i)}
          <Skeleton class="h-14 w-full rounded-xl" />
        {/each}
      {:else if moves.length}
        {#each moves as mv, i (`move-${i}-${mv.move.id}`)}
          <div class="rounded-xl border bg-background p-3 hover:bg-muted">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <a href={moveUrl(mv.move.id)} class="font-medium hover:underline">{mv.move.name}</a>
                  <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{mv.move.type.name}</span>
                  <span class="text-xs text-muted-foreground">{mv.move.category.name}</span>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-3">
                  <span class="text-xs text-muted-foreground">{mv.method.name}</span>
                  {#if mv.level}
                    <span class="text-xs text-muted-foreground">Lv. {mv.level}</span>
                  {/if}
                  <span class="text-xs text-muted-foreground">
                    Pow: {mv.move.power ?? '—'}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Acc: {mv.move.accuracy ?? '—'}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    PP: {mv.move.pp ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <div class="text-sm text-muted-foreground">No moves data.</div>
      {/if}
    </div>
  </Card.Content>
</Card.Root>
