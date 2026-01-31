<script lang="ts">
  import { cn } from '$lib/utils';

  let { class: className = '' }: { class?: string } = $props();
</script>

<footer
  class={cn(
    'mt-auto border-t bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground md:px-6',
    className,
  )}
>
  <div class="mx-auto max-w-2xl space-y-2">
    <p>Thanks for reading</p>
    <p class="text-xs">
      Message Zmjjkk on Discord
    </p>
  </div>
</footer>
