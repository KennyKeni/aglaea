<script lang="ts">
  import { replaceState } from '$app/navigation';
  import type { TocItem } from '$lib/utils/toc';
  import { cn } from '$lib/utils';
  import { createScrollSpy } from '$lib/state/scroll-spy.svelte';

  let { toc, class: className = '' }: { toc: TocItem[]; class?: string } = $props();

  const titleItem = $derived(toc.find((item) => item.level === 0));
  const contentItems = $derived(toc.filter((item) => item.level > 0));
  const minLevel = $derived(Math.min(...contentItems.map((item) => item.level)));

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
      rootMargin: '-80px 0px -70% 0px',
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
  <nav class={cn('sticky top-24 max-h-[calc(100vh-8rem)] w-80 overflow-y-auto pl-6 pr-4', className)}>
    {#if titleItem}
      {@const isActive = activeId === titleItem.id}
      <a
        href="#{titleItem.id}"
        class={cn(
          'mb-4 block truncate text-sm font-medium tracking-tight transition-colors',
          isActive ? 'text-foreground' : 'text-foreground/90 hover:text-foreground',
        )}
        onclick={(e) => scrollToHeading(e, titleItem.id)}
        title={titleItem.text}
      >
        {titleItem.text}
      </a>
    {:else}
      <h4 class="mb-4 text-sm font-medium tracking-tight text-foreground/90">On this page</h4>
    {/if}
    {#if contentItems.length > 0}
      <ul class="relative flex flex-col gap-0 border-l border-border/50">
        {#each contentItems as item (item.id)}
          {@const indent = (item.level - minLevel) * 0.75 + 0.75}
          {@const isActive = activeId === item.id}
          <li
            class={cn(
              'relative -ml-px border-l-2 transition-[border-color] duration-300 ease-in-out',
              isActive ? 'border-foreground' : 'border-transparent hover:border-foreground/30',
            )}
          >
            <a
              href="#{item.id}"
              class={cn(
                'block py-1.5 pr-2 text-sm leading-snug transition-[color,opacity] duration-300 ease-in-out',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              style:padding-left={`${indent}rem`}
              onclick={(e) => scrollToHeading(e, item.id)}
            >
              <span
                class={cn(
                  'block truncate origin-left transition-[transform,font-weight] duration-300 ease-in-out',
                  isActive && 'scale-[1.02] font-medium',
                )}
                title={item.text}
              >
                {item.text}
              </span>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </nav>
{/if}
