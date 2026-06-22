<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import LoadingMosaic from './loading-mosaic.svelte';

  let {
    items,
    isLoading = false,
    isRefreshing = false,
    skeletonCount = 8,
    card,
    skeleton,
  }: {
    items: T[];
    isLoading?: boolean;
    isRefreshing?: boolean;
    skeletonCount?: number;
    card: Snippet<[T]>;
    skeleton: Snippet;
  } = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-6">
  <div class="relative" aria-busy={isLoading || isRefreshing}>
    {#if isLoading}
      <div class="sr-only" role="status">Loading results</div>
    {/if}

    {#if isRefreshing}
      <div class="pointer-events-none absolute inset-x-0 -top-3 z-10 flex justify-center">
        <div
          class="flex items-center gap-2 rounded-md border border-border/70 bg-background/95 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
        >
          <LoadingMosaic size="xs" label="Updating results" />
          <span>Updating results</span>
        </div>
      </div>
    {/if}

    <div
      class="grid gap-3 transition-opacity duration-150 grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))]"
      class:opacity-60={isRefreshing}
    >
      {#if isLoading}
        {#each { length: skeletonCount }, i (i)}
          {@render skeleton()}
        {/each}
      {:else}
        {#each items as item (item)}
          {@render card(item)}
        {/each}
      {/if}
    </div>
  </div>
</div>
