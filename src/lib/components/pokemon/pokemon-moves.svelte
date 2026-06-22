<script lang="ts">
  import { resolve } from '$app/paths';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import type { FormMove } from '$lib/types/pokemon';

  let {
    title = 'Moves',
    moves = [],
    loading = false,
    methodSlug,
  }: {
    title?: string;
    moves?: FormMove[];
    loading?: boolean;
    methodSlug?: string;
  } = $props();

  const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

  const sorted = $derived(
    [...moves].sort((a, b) => {
      if (methodSlug === 'level-up') {
        if (a.level != null && b.level != null) return a.level - b.level;
        if (a.level != null) return -1;
        if (b.level != null) return 1;
      }
      return a.move.name.localeCompare(b.move.name);
    }),
  );
</script>

<section id="moves" class="space-y-3">
  <div>
    <h2 class="text-base font-semibold">{title}</h2>
    <div class="mt-1 text-sm text-muted-foreground">
      {#if loading}
        Loading moves...
      {:else}
        {moves.length} moves
      {/if}
    </div>
  </div>
  <div class="space-y-2">
    {#if loading}
      {#each skeletonRows as skeletonIndex (skeletonIndex)}
        <Skeleton class="h-14 w-full rounded-xl" />
      {/each}
    {:else if moves.length}
      {#each sorted as mv, i (`move-${i}-${mv.move.id}`)}
        <div class="rounded-xl border bg-background p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <a
                  href={resolve('/moves/[id]', { id: String(mv.move.id) })}
                  class="font-medium hover:underline">{mv.move.name}</a
                >
                <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                  >{mv.move.type.name}</span
                >
                <span class="text-xs text-muted-foreground">{mv.move.category.name}</span>
              </div>
              <div class="mt-1 flex flex-wrap items-center gap-3">
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
</section>
