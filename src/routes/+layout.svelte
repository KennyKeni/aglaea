<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { AppSidebar, AppHeader } from '$lib/components/layout';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const isAuthPage = $derived(
		page.url.pathname === '/login' || page.url.pathname === '/signup'
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isAuthPage}
	{@render children()}
{:else}
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset class="flex flex-col">
			<AppHeader />
			<main class="relative flex-1 overflow-hidden">
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
