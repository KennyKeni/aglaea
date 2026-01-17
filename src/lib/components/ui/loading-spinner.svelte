<script lang="ts">
  import { Loader2 } from '@lucide/svelte';

  let {
    size = 'default',
    class: className = '',
  }: { size?: 'sm' | 'default' | 'lg'; class?: string } = $props();

  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
</script>

<div class="flex items-center justify-center {className}">
  <Loader2 class="{sizeClasses[size]} animate-spin text-muted-foreground" />
</div>
