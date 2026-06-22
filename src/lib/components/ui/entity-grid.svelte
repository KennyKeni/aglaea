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
  {#if isLoading}
    <div class="flex flex-col items-center justify-center gap-3 pt-2 pb-6">
      <LoadingMosaic size="lg" label="Loading results" />
      <p class="text-xs font-medium text-muted-foreground">Loading results</p>
    </div>
  {/if}

  <div class="relative" aria-busy={isLoading || isRefreshing}>
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
      class="grid gap-3 transition-opacity duration-150 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
