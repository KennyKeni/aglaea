<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import { useScrollDirection } from '$lib/hooks/use-scroll-direction.svelte';
	import { Button } from '$lib/components/ui/button';
	import { LogIn, LogOut } from '@lucide/svelte';

	const session = authClient.useSession();
	const scroll = useScrollDirection();

	const navLinks = [
		{ href: '/pokemon', label: 'Pokemon' },
		{ href: '/articles', label: 'Articles' }
	];

	function isActive(href: string): boolean {
		return page.url.pathname.startsWith(href);
	}

	async function handleSignOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/';
				}
			}
		});
	}
</script>

<header
	class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur transition-transform duration-300 md:translate-y-0"
	class:-translate-y-full={scroll.isScrollingDown}
>
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
		<div class="flex items-center gap-6">
			<a href="/" class="text-lg font-bold">Aglaea</a>
			<nav class="hidden items-center gap-1 md:flex">
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						class="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
						class:text-foreground={isActive(link.href)}
						class:bg-accent={isActive(link.href)}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-1">
			{#if $session.data}
				<span class="hidden text-sm font-medium md:inline">
					{$session.data.user.name || $session.data.user.email}
				</span>
				<Button variant="ghost" size="sm" onclick={handleSignOut}>
					<LogOut class="h-4 w-4" />
					<span class="sr-only">Sign out</span>
				</Button>
			{:else}
				<Button variant="ghost" size="sm" href="/login">
					<LogIn class="h-4 w-4" />
					<span class="hidden md:inline">Sign in</span>
				</Button>
			{/if}
		</div>
	</div>

	<nav class="border-t px-4 py-2 md:hidden">
		<div class="flex gap-1">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="text-muted-foreground hover:text-foreground flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors"
					class:text-foreground={isActive(link.href)}
					class:bg-accent={isActive(link.href)}
				>
					{link.label}
				</a>
			{/each}
		</div>
	</nav>
</header>
