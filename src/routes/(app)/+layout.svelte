<script lang="ts">
  import { goto } from '$app/navigation';
  import { AppSidebar, AppHeader, EmailVerificationBanner } from '$lib/components/layout';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { SearchPalette } from '$lib/components/search-palette';
  import { allSearchSources } from '$lib/api/endpoints/search';
  import { createCommandPalette } from '$lib/state/command-palette.svelte';
  import { entityUrl } from '$lib/utils/url';
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

  function handleSelect(result: SearchResult) {
    goto(entityUrl(result.source, result.id));
  }

  const navigation = $derived(
    baseNavigation.map((section) => {
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
      if (section.label === 'Articles') {
        return {
          ...section,
          children: [
            { label: 'All', href: '/articles' },
            ...data.articleCategories.map((cat: { name: string; slug: string }) => ({
              label: cat.name,
              href: `/articles?categories=${cat.slug}`,
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
    <AppHeader session={data.session} />
    {#if data.session && !data.session.user.emailVerified}
      <EmailVerificationBanner email={data.session.user.email} />
    {/if}
    <main class="flex flex-1 flex-col">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
