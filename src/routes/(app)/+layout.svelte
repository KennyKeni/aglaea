<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { AppSidebar, AppHeader } from '$lib/components/layout';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { SearchPalette } from '$lib/components/search-palette';
  import { allSearchSources } from '$lib/api/endpoints/search';
  import { createCommandPalette } from '$lib/state/command-palette.svelte';
  import { baseNavigation } from '$lib/config/navigation';
  import type { SearchResult } from '$lib/types/search';

  let { data, children } = $props();

  const palette = createCommandPalette();

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      palette.toggle();
    }
  }

  function searchResultUrl(result: SearchResult): string {
    switch (result.source) {
      case 'pokemon':
        return resolve('/pokemon/[id]', { id: String(result.id) });
      case 'moves':
        return resolve('/moves/[id]', { id: String(result.id) });
      case 'abilities':
        return resolve('/abilities/[id]', { id: String(result.id) });
      case 'items':
        return resolve('/items/[id]', { id: String(result.id) });
      case 'types':
        return `${resolve('/pokemon')}?types=${encodeURIComponent(result.slug)}`;
    }
  }

  function handleSelect(result: SearchResult) {
    goto(searchResultUrl(result));
  }

  const navigation = $derived(
    baseNavigation.map((section) => {
      if ('href' in section) return section;

      if (section.label === 'Moves') {
        return {
          ...section,
          children: [
            { label: 'All', href: '/moves' },
            ...data.moveCategories.map((cat: { name: string; slug: string }) => ({
              label: cat.name,
              href: `/moves?categories=${cat.slug}`,
            })),
          ],
        };
      }
      if (section.label === 'Items') {
        return {
          ...section,
          children: [
            { label: 'All', href: '/items' },
            { label: 'Battle Items', href: '/items?tags=battle-items' },
          ],
        };
      }
      return section;
    }),
  );
</script>

<svelte:window onkeydown={handleKeydown} />

<SearchPalette
  bind:open={palette.open}
  sources={allSearchSources}
  onselect={handleSelect}
  placeholder="Search pokemon, moves, items..."
/>

<Sidebar.Provider>
  <AppSidebar {navigation} />
  <Sidebar.Inset>
    <AppHeader />
    <main class="flex flex-1 flex-col">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
