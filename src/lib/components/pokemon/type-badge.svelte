<script lang="ts">
  import { cn } from '$lib/utils';
  import { TYPE_COLORS } from '$lib/utils/pokemon';
  import type { NamedRef } from '$lib/types/base';
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'clsx';

  type Size = 'sm' | 'md';

  let {
    type,
    size = 'sm',
    children,
    class: className,
  }: {
    type: Pick<NamedRef, 'name' | 'slug'>;
    size?: Size;
    children?: Snippet;
    class?: ClassValue;
  } = $props();

  const sizeClasses: Record<Size, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
</script>

<span
  class={cn(
    'inline-flex items-center rounded-full font-medium',
    sizeClasses[size],
    TYPE_COLORS[type.slug] || 'bg-muted text-muted-foreground',
    className,
  )}
>
  {type.name}
  {@render children?.()}
</span>
