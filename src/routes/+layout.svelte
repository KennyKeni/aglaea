<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { Navbar } from '$lib/components/layout';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const isAuthPage = $derived(
		page.url.pathname === '/login' || page.url.pathname === '/signup'
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if !isAuthPage}
	<Navbar />
{/if}
{@render children()}
<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
