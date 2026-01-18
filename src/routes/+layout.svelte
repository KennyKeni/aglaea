<script lang="ts">
  import { page } from '$app/state';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
  import { AppSidebar, AppHeader } from '$lib/components/layout';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { permissions } from '$lib/state/permissions.svelte';
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
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isAuthPage}
  {@render children()}
{:else}
  <Sidebar.Provider>
    <AppSidebar />
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
