<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { AppSidebar, AppHeader } from '$lib/components/layout';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { permissions } from '$lib/state/permissions.svelte';
	import { authClient } from '$lib/auth-client';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();

	const session = authClient.useSession();

	$effect(() => {
		permissions.init(data.permissions);
	});

	$effect(() => {
		const isLoggedIn = !!$session.data;
		if (!isLoggedIn) {
			permissions.clear();
		} else if (!permissions.data && isLoggedIn) {
			permissions.fetch(fetch);
		}
	});

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
		<Sidebar.Inset>
			<AppHeader />
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
