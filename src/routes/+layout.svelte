<script lang="ts">
  import { page } from '$app/state';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
  import { AppSidebar, AppHeader } from '$lib/components/layout';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { permissions } from '$lib/state/permissions.svelte';
  import { baseNavigation } from '$lib/config/navigation';
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';

  let { data, children } = $props();

  $effect(() => {
    permissions.init(data.permissions);
  });

  $effect(() => {
    if (!data.session) {
      permissions.clear();
    }
  });

  const isAuthPage = $derived(page.url.pathname === '/login' || page.url.pathname === '/signup');

  const navigation = $derived(
    baseNavigation.map((section) => {
      if (section.label === 'Articles') {
        return {
          ...section,
          children: [
            { label: 'All', href: '/articles' },
            ...data.articleCategories.map((cat) => ({
              label: cat.name,
              href: `/articles?categories=${cat.slug}`,
            })),
          ],
        };
      }
      return section;
    }),
  );
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isAuthPage}
  {@render children()}
{:else}
  <Sidebar.Provider>
    <AppSidebar {navigation} />
    <Sidebar.Inset>
      <AppHeader session={data.session} />
      <main class="flex-1">
        {@render children()}
      </main>
    </Sidebar.Inset>
  </Sidebar.Provider>
{/if}
<div style="display:none">
  {#each locales as locale (locale)}
    <a href={localizeHref(page.url.pathname, { locale })}>
      {locale}
    </a>
  {/each}
</div>
