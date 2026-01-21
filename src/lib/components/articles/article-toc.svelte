<script lang="ts">
  import { replaceState } from '$app/navigation';
  import type { TocItem } from '$lib/utils/toc';
  import { cn } from '$lib/utils';
  import { createScrollSpy } from '$lib/state/scroll-spy.svelte';

  let { toc, class: className = '' }: { toc: TocItem[]; class?: string } = $props();

  let activeId = $state<string | null>(null);

  function scrollToId(id: string, behavior: ScrollBehavior = 'smooth') {
    const target = document.getElementById(id);
    if (!target) return;

    const viewport = target.closest('[data-slot="scroll-area-viewport"]');
    if (viewport) {
      const targetRect = target.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      viewport.scrollTo({
        top: viewport.scrollTop + targetRect.top - viewportRect.top - 20,
        behavior,
      });
    } else {
      target.scrollIntoView({ behavior });
    }
  }

  $effect(() => {
    if (toc.length === 0) return;

    const firstItem = toc[0];
    if (!firstItem) return;

    const selector = toc.map((item) => `#${CSS.escape(item.id)}`).join(', ');
    const firstHeading = document.getElementById(firstItem.id);
    const root = firstHeading?.closest('[data-slot="scroll-area-viewport"]') as Element | null;

    const spy = createScrollSpy({
      selector,
      root,
      rootMargin: '-5rem 0px -70% 0px',
      onActiveChange: (id) => {
        activeId = id;
        if (id) replaceState(`#${id}`, {});
      },
    });

    spy.start();

    const hash = window.location.hash.slice(1);
    if (hash && toc.some((item) => item.id === hash)) {
      requestAnimationFrame(() => scrollToId(hash, 'instant'));
    }

    return () => spy.stop();
  });

  function scrollToHeading(e: MouseEvent, id: string) {
    e.preventDefault();
    scrollToId(id);
  }
</script>

{#if toc.length > 0}
  <nav class={cn('sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto', className)}>
    <h4 class="mb-3 text-sm font-medium text-foreground/90">On this page</h4>
    <ul class="flex flex-col gap-1.5 text-sm">
      {#each toc as item (item.id)}
        {@const indent = Math.max(item.level, 0) * 0.5}
        {@const isActive = activeId === item.id}
        <li
          style:padding-left={`${indent}rem`}
          class={cn(
            'transition-colors hover:text-foreground',
            isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
          )}
        >
          <a href="#{item.id}" class="block py-0.5" onclick={(e) => scrollToHeading(e, item.id)}>
            {item.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}
