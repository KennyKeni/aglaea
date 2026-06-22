<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton';
  import type { Item } from '$lib/types/item';

  let {
    item,
    loading = false,
    href,
  }: {
    item?: Item;
    loading?: boolean;
    href?: string;
  } = $props();
</script>

{#if loading}
  <div class="flex min-h-[200px] flex-col rounded-lg border border-border p-4">
    <div class="space-y-2">
      <Skeleton class="h-5 w-24" />
      <div class="flex gap-1.5">
        <Skeleton class="h-5 w-16 rounded-full" />
      </div>
    </div>
    <Skeleton class="mt-auto h-12 w-full" />
  </div>
{:else if item}
  <a
    {href}
    class="group flex h-full w-full flex-col rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/50"
  >
    <div class="space-y-2">
      <div class="truncate text-base font-semibold">{item.name}</div>
      <div class="flex flex-wrap gap-1.5">
        {#if item.namespace}
          <span
            class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
          >
            {item.namespace.name}
          </span>
        {/if}
        {#each item.tags.slice(0, 3) as tag (tag.id)}
          <span
            class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
          >
            {tag.name}
          </span>
        {/each}
        {#if item.tags.length > 3}
          <span
            class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          >
            +{item.tags.length - 3}
          </span>
        {/if}
      </div>
    </div>

    <div class="mt-auto line-clamp-3 text-sm text-muted-foreground">
      {item.shortDesc || item.desc || ''}
    </div>
  </a>
{/if}
