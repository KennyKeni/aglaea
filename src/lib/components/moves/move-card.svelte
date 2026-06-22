<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { cn } from '$lib/utils';
  import { TYPE_COLORS } from '$lib/utils/pokemon';
  import type { Move } from '$lib/types/move';

  let {
    move,
    loading = false,
    href,
  }: {
    move?: Move;
    loading?: boolean;
    href?: string;
  } = $props();

  function formatAccuracy(accuracy: Move['accuracy']) {
    if (accuracy === true) return 'Always';
    if (accuracy === false) return 'Never';
    if (accuracy == null) return null;
    return `${accuracy}%`;
  }
</script>

{#if loading}
  <div class="flex min-h-[200px] flex-col rounded-lg border border-border p-4">
    <div class="space-y-2">
      <Skeleton class="h-5 w-24" />
      <div class="flex gap-1.5">
        <Skeleton class="h-5 w-14 rounded-full" />
        <Skeleton class="h-5 w-16 rounded-full" />
      </div>
    </div>
    <div class="mt-3 flex gap-4">
      <Skeleton class="h-4 w-16" />
      <Skeleton class="h-4 w-16" />
      <Skeleton class="h-4 w-12" />
    </div>
    <Skeleton class="mt-auto h-12 w-full" />
  </div>
{:else if move}
  <a
    {href}
    class="group flex h-full w-full flex-col rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/50"
  >
    <div class="space-y-2">
      <div class="truncate text-base font-semibold">{move.name}</div>
      <div class="flex flex-wrap gap-1.5">
        <span
          class={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            TYPE_COLORS[move.type.slug] || 'bg-muted',
          )}
        >
          {move.type.name}
        </span>
        <span
          class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
        >
          {move.category.name}
        </span>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {#if move.power}
        <span>Power: <strong class="text-foreground">{move.power}</strong></span>
      {/if}
      {#if move.accuracy != null}
        <span>Acc: <strong class="text-foreground">{formatAccuracy(move.accuracy)}</strong></span>
      {/if}
      <span>PP: <strong class="text-foreground">{move.pp}</strong></span>
    </div>

    <div class="mt-auto line-clamp-3 text-sm text-muted-foreground">
      {move.shortDesc || move.desc || ''}
    </div>
  </a>
{/if}
