<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { X } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    closeHref: string;
    actions?: Snippet;
  }

  let { title, closeHref, actions }: Props = $props();
</script>

<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
  <div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
    <h1 class="min-w-0 truncate text-sm font-semibold">
      {title}
    </h1>
    <div class="flex items-center gap-2">
      {#if actions}
        {@render actions()}
      {/if}
      <Button variant="ghost" size="icon" href={closeHref} aria-label="Close">
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>
</header>
