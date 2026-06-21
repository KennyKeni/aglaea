<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { onDestroy } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { Search, Sun, Moon } from '@lucide/svelte';
  import { SvelteURLSearchParams } from 'svelte/reactivity';

  type SearchContext = {
    entity: 'pokemon' | 'moves' | 'abilities' | 'items';
    label: string;
    route: '/pokemon' | '/moves' | '/abilities' | '/items';
  };

  let searchQuery = $derived(page.url.searchParams.get('search') ?? '');
  let isDark = $state(browser ? document.documentElement.classList.contains('dark') : false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }

  const searchContext = $derived.by((): SearchContext | null => {
    const path = page.url.pathname;
    if (path.startsWith('/pokemon'))
      return { entity: 'pokemon', label: 'Pokemon', route: '/pokemon' };
    if (path.startsWith('/moves')) return { entity: 'moves', label: 'Moves', route: '/moves' };
    if (path.startsWith('/abilities'))
      return { entity: 'abilities', label: 'Abilities', route: '/abilities' };
    if (path.startsWith('/items')) return { entity: 'items', label: 'Items', route: '/items' };
    return null;
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;

    if (!searchContext) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const params = new SvelteURLSearchParams(page.url.searchParams);
      if (searchQuery.trim()) {
        params.set('search', searchQuery);
        params.delete('page');
      } else {
        params.delete('search');
      }
      const queryString = params.toString();
      const basePath = resolve(searchContext.route);
      // The path is resolved above, then the current query string is appended.
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      goto(queryString ? `${basePath}?${queryString}` : basePath, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
    }, 300);
  }

  onDestroy(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });
</script>

<header
  class="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <Sidebar.Trigger class="-ml-1" />

  <div class="flex flex-1 items-center justify-center px-4">
    {#if searchContext}
      <div class="relative w-full max-w-md">
        <Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search {searchContext.label}..."
          class="pl-9"
          value={searchQuery}
          oninput={handleInput}
        />
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-3">
    <Button variant="ghost" size="icon" onclick={toggleTheme} class="h-8 w-8">
      {#if isDark}
        <Sun class="h-4 w-4" />
      {:else}
        <Moon class="h-4 w-4" />
      {/if}
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>
</header>
