<script lang="ts">
  import { cn } from '$lib/utils';

  let { class: className = '' }: { class?: string } = $props();
</script>

<footer
  class={cn(
    'mt-16 border-t bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground md:px-6',
    className,
  )}
>
  <div class="mx-auto max-w-2xl space-y-2">
    <p>Thanks for reading</p>
    <p class="text-xs">
      Have feedback or found an issue?
      <a href="/feedback" class="underline underline-offset-4 hover:text-foreground">
        Let us know
      </a>
    </p>
  </div>
</footer>
