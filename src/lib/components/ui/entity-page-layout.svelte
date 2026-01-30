<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    footerText: string;
    children: Snippet;
  }

  let { footerText, children }: Props = $props();
</script>

<div class="flex flex-1 flex-col bg-muted/30">
  <div class="flex-1">
    {@render children()}
  </div>
  <div class="border-t bg-background">
    <div class="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
      {footerText}
    </div>
  </div>
</div>
