<script lang="ts">
  import LoadingMosaic from './loading-mosaic.svelte';

  type Size = 'sm' | 'default' | 'lg';
  type MosaicSize = 'sm' | 'default' | 'lg';

  let {
    size = 'default',
    class: className = '',
    label = 'Loading',
  }: { size?: Size; class?: string; label?: string } = $props();

  const sizeClasses: Record<Size, MosaicSize> = {
    sm: 'sm',
    default: 'default',
    lg: 'lg',
  };
</script>

<div class="flex items-center justify-center {className}">
  <LoadingMosaic size={sizeClasses[size]} {label} />
</div>
