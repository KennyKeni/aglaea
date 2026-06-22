<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';

  type Size = 'xs' | 'sm' | 'default' | 'lg';

  const PALETTE = ['#63c174', '#4cc38a', '#ffca16', '#7ce2fe', '#ff977d'];
  const BASE_CELLS = Array.from({ length: 9 }, (_, id) => ({
    id,
    color: PALETTE[id % PALETTE.length],
    opacity: 0.82,
    scale: 0.92,
  }));

  let {
    size = 'default',
    label = 'Loading',
    class: className = '',
  }: {
    size?: Size;
    label?: string;
    class?: string;
  } = $props();

  let reducedMotion = $state(false);
  let step = $state(0);
  const cells = $derived(reducedMotion ? BASE_CELLS : makeCells(step));

  const sizeClasses: Record<Size, string> = {
    xs: 'size-4 gap-0.5 rounded-[3px]',
    sm: 'size-5 gap-0.5 rounded-[4px]',
    default: 'size-9 gap-1 rounded-md',
    lg: 'size-12 gap-1.5 rounded-lg',
  };

  function hash(value: number) {
    let x = value | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return Math.abs(x);
  }

  function makeCells(nextStep: number) {
    return BASE_CELLS.map((cell) => {
      const seed = hash((nextStep + 1) * 97 + cell.id * 193 + cell.id * cell.id * 17);
      const colorIndex = (seed + cell.id + nextStep) % PALETTE.length;
      const isLit = seed % 5 < 3;

      return {
        id: cell.id,
        color: PALETTE[colorIndex],
        opacity: isLit ? 1 : 0.46,
        scale: 0.78 + (seed % 6) * 0.04,
      };
    });
  }

  onMount(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let interval: ReturnType<typeof setInterval> | undefined;

    function stop() {
      if (interval) clearInterval(interval);
      interval = undefined;
    }

    function advance() {
      step += 1;
    }

    function syncMotionPreference() {
      reducedMotion = media.matches;
      stop();

      if (media.matches) {
        return;
      }

      advance();
      interval = setInterval(advance, 180);
    }

    syncMotionPreference();
    media.addEventListener('change', syncMotionPreference);

    return () => {
      stop();
      media.removeEventListener('change', syncMotionPreference);
    };
  });
</script>

<div
  class={cn('grid grid-cols-3 grid-rows-3', sizeClasses[size], className)}
  role="status"
  aria-label={label}
  data-reduced-motion={reducedMotion}
>
  {#each cells as cell (cell.id)}
    <span
      class="loading-mosaic-cell block aspect-square rounded-[2px]"
      aria-hidden="true"
      style:--loader-cell-color={cell.color}
      style:--loader-cell-opacity={cell.opacity}
      style:--loader-cell-scale={cell.scale}
    ></span>
  {/each}
</div>

<style>
  .loading-mosaic-cell {
    background: var(--loader-cell-color);
    opacity: var(--loader-cell-opacity);
    transform: scale(var(--loader-cell-scale));
    transform-origin: center;
    transition:
      background-color 260ms cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 220ms ease,
      transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      0 0 0 1px color-mix(in oklab, var(--loader-cell-color), transparent 62%),
      0 0 10px color-mix(in oklab, var(--loader-cell-color), transparent 58%);
  }

  [data-reduced-motion='true'] .loading-mosaic-cell {
    transition: none;
    opacity: 0.86;
    transform: scale(0.9);
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--loader-cell-color), transparent 70%);
  }
</style>
