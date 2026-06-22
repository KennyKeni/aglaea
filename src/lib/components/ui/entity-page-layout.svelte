<script lang="ts">
  import { AFFILIATION_DISCLAIMER } from '$lib/config/disclaimers';
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
    <div class="mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs text-muted-foreground">
      <p>{footerText}</p>
      <p class="leading-relaxed">{AFFILIATION_DISCLAIMER}</p>
    </div>
  </div>
</div>
