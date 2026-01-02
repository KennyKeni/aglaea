<script lang="ts">
	import { page, navigating } from '$app/state';
	import { goto, preloadData, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Search, X, Maximize2, Minimize2, Layers, Sun, Moon } from '@lucide/svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { cn } from '$lib/utils';
	import type { Action } from 'svelte/action';
	import { TYPE_COLORS, formatId, getArtworkUrl, getStatTotal, clamp, type Pokemon } from './types';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		const fromPath = navigation.from?.url.pathname ?? '';
		const toPath = navigation.to?.url.pathname ?? '';
		const fromId = fromPath.match(/\/pokemon\/(\d+)/)?.[1];
		const toId = toPath.match(/\/pokemon\/(\d+)/)?.[1];
		const toFocus = navigation.to?.url.searchParams.get('focus');

		// Skip view transition for expand/collapse (same pokemon, just changing view)
		if ((fromId && toFocus === fromId) || (toId && fromPath === '/pokemon')) {
			return;
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	interface LayoutData {
		pokemon: Pokemon[];
	}

	let { data, children }: { data: LayoutData; children: any } = $props();

	let query = $state('');
	let isMd = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		isMd = mq.matches;
		const handler = (e: MediaQueryListEvent) => (isMd = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	let filtered = $derived.by(() => {
		const s = query.trim().toLowerCase();
		if (!s) return data.pokemon;
		return data.pokemon.filter(
			(m) => m.name.toLowerCase().includes(s) || String(m.id).includes(s)
		);
	});

	let focusId = $derived(page.url.searchParams.get('focus'));
	let isDetailRoute = $derived(page.route.id?.includes('[id]') ?? false);
	let focusedPokemon = $derived(
		focusId ? data.pokemon.find((p) => String(p.id) === focusId) : null
	);

	let isNavigatingToDetail = $derived(
		navigating?.to?.route.id?.includes('[id]') ?? false
	);
	let navigatingToId = $derived(
		isNavigatingToDetail ? navigating?.to?.params?.id : null
	);
	let navigatingToPokemon = $derived(
		navigatingToId ? data.pokemon.find((p) => String(p.id) === navigatingToId) : null
	);

	let mode = $derived<'closed' | 'peek' | 'full'>(
		isDetailRoute || isNavigatingToDetail ? 'full' : focusId ? 'peek' : 'closed'
	);
	let showPanel = $derived(mode !== 'closed' || isNavigatingToDetail);
	let peekWidth = $derived(isMd ? '50vw' : '100vw');
	let panelWidth = $derived(mode === 'full' ? '100vw' : peekWidth);
	let panelBorderRadius = $derived(mode === 'full' ? '0px' : '28px');
	let showOverlay = $derived(mode === 'peek' && !isNavigatingToDetail);
	let isLoading = $derived(isNavigatingToDetail);

	function openPeek(mon: Pokemon) {
		goto(`/pokemon?focus=${mon.id}`, { noScroll: true });
		preloadData(`/pokemon/${mon.id}`);
	}

	function expand() {
		if (!focusId) return;
		goto(`/pokemon/${focusId}`, { noScroll: true });
	}

	function collapse() {
		if (!isDetailRoute) return;
		const currentId = page.params.id;
		goto(`/pokemon?focus=${currentId}`, { noScroll: true });
	}

	function close() {
		goto('/pokemon', { noScroll: true });
	}

	const slideIn: Action<HTMLElement> = (node) => {
		node.style.transform = 'translateX(100%)';
		requestAnimationFrame(() => {
			animate(node, { transform: 'translateX(0%)' }, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
		});
	};

	let currentPokemon = $derived(
		navigatingToPokemon ??
		(isDetailRoute
			? data.pokemon.find((p) => String(p.id) === page.params.id)
			: focusedPokemon)
	);

	let cachedPokemon: Pokemon | null = null;
	let activePokemon = $derived.by(() => {
		if (currentPokemon) {
			cachedPokemon = currentPokemon;
		}
		return cachedPokemon;
	});
</script>

<div class="bg-muted/30 min-h-screen">
	<div class="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
			<div class="flex items-center gap-2 font-semibold">
				<Layers class="h-5 w-5" />
				Dex
			</div>
			<div class="relative flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input bind:value={query} placeholder="Search Pokemon (name or #)" class="pl-9" />
			</div>
			<div class="text-muted-foreground hidden items-center gap-2 text-xs md:flex">
				<span class="bg-muted rounded-full px-3 py-1">{filtered.length} results</span>
			</div>
			<Button variant="ghost" size="icon" onclick={() => theme.toggle()} aria-label="Toggle theme">
				{#if theme.isDark}
					<Sun class="h-5 w-5" />
				{:else}
					<Moon class="h-5 w-5" />
				{/if}
			</Button>
		</div>
	</div>

	<div class="mx-auto max-w-6xl px-4 py-6">
		<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each filtered as mon (mon.id)}
				{@const defaultForm = mon.forms[0]}
				<button
					onclick={() => openPeek(mon)}
					class="group text-left"
				>
					<Card.Root class="hover:border-primary/30 rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
						<Card.Header class="pb-2">
							<div class="flex items-start justify-between gap-3">
								<div>
									<div class="text-muted-foreground text-xs font-medium">{formatId(mon.id)}</div>
									<Card.Title class="text-base">{mon.name}</Card.Title>
								</div>
								<img
									src={getArtworkUrl(mon.id)}
									alt={mon.name}
									class="bg-muted h-14 w-14 rounded-xl object-contain"
								/>
							</div>
						</Card.Header>
						<Card.Content class="space-y-3">
							<div class="flex flex-wrap gap-2">
								{#each defaultForm.types as { type } (type.id)}
									<span
										class={cn(
											'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
											TYPE_COLORS[type.slug] || 'bg-muted'
										)}
									>
										{type.name}
									</span>
								{/each}
							</div>
							<div class="text-muted-foreground line-clamp-2 text-sm">
								{mon.description || ''}
							</div>
							<div class="text-muted-foreground flex items-center justify-between text-xs">
								<span class="bg-muted rounded-full px-2 py-1">Click to preview</span>
							</div>
						</Card.Content>
					</Card.Root>
				</button>
			{/each}
		</div>
	</div>

	{#if showPanel && activePokemon}
		{#key activePokemon.id}
			<button
				aria-label="Close panel"
				class="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200"
				style="opacity: {showOverlay ? 1 : 0}; pointer-events: {showOverlay ? 'auto' : 'none'}"
				onclick={close}
			></button>

			<aside
				use:slideIn
				class="bg-background fixed top-0 right-0 z-40 h-dvh shadow-2xl transition-[width,border-radius,border-left] duration-300 ease-out"
				style="width: {panelWidth}; border-top-left-radius: {panelBorderRadius}; border-left: {mode === 'peek' ? '1px solid hsl(var(--border))' : 'none'}"
			>
				<div class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
					<div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
						<div class="flex min-w-0 items-center gap-2">
							<div class="truncate text-sm font-semibold">
								{activePokemon.name} {formatId(activePokemon.id)}
							</div>
							{#if mode === 'peek'}
								<Badge variant="secondary" class="shrink-0 rounded-full px-2 py-0.5 text-[11px]">
									Preview
								</Badge>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							{#if mode === 'peek'}
								<Button variant="secondary" size="sm" onclick={expand}>
									<Maximize2 class="mr-2 h-4 w-4" />
									Expand
								</Button>
							{:else if mode === 'full'}
								<Button variant="secondary" size="sm" onclick={collapse}>
									<Minimize2 class="mr-2 h-4 w-4" />
									Half
								</Button>
							{/if}
							<Button variant="ghost" size="icon" onclick={close} aria-label="Close">
								<X class="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				<ScrollArea class="h-[calc(100dvh-56px)]">
					<div class="px-4 py-4 md:px-6 md:py-6">
						{#if isLoading && activePokemon}
							{@const form = activePokemon.forms[0]}
							{#if activePokemon.forms.length > 1}
								<div class="mb-4 flex flex-wrap items-center gap-2">
									<span class="text-muted-foreground text-xs">Form:</span>
									{#each activePokemon.forms as f, idx (`${activePokemon.id}-form-${idx}`)}
										<span
											class={cn(
												'whitespace-nowrap rounded-full border px-3 py-1 text-xs',
												idx === 0
													? 'bg-primary text-primary-foreground border-primary'
													: 'bg-background'
											)}
										>
											{f.name}
										</span>
									{/each}
								</div>
							{/if}
							<Card.Root class="rounded-2xl">
								<Card.Content class="p-4 md:p-6">
									<div class="grid gap-4 md:grid-cols-12">
										<div class="self-stretch md:col-span-4">
											<div class="bg-muted flex h-full flex-col rounded-2xl p-4 md:p-5">
												<div class="flex h-52 w-full flex-1 items-center justify-center md:h-auto">
													<img
														src={getArtworkUrl(activePokemon.id)}
														alt={form.name}
														class="h-full w-full object-contain"
													/>
												</div>
												<div class="mt-3 text-center">
													<div class="text-base font-semibold">{form.name}</div>
												</div>
											</div>
										</div>
										<div class="space-y-3 md:col-span-8">
											<div class="flex items-start justify-between gap-3">
												<div>
													<div class="text-muted-foreground text-xs font-medium">
														{formatId(activePokemon.id)}
													</div>
													<div class="text-3xl font-semibold">{activePokemon.name}</div>
												</div>
												<div class="flex flex-wrap gap-2">
													{#each form.types as { type } (type.id)}
														<span class={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TYPE_COLORS[type.slug] || 'bg-muted')}>
															{type.name}
														</span>
													{/each}
												</div>
											</div>
											<div class="bg-background rounded-2xl border p-4">
												<div class="mb-2 flex items-center justify-between">
													<div class="text-muted-foreground text-xs font-medium">Base stats</div>
													<div class="text-muted-foreground text-xs tabular-nums">
														Total {getStatTotal(form)}
													</div>
												</div>
												<div class="space-y-2">
													{#each [
														{ label: 'HP', value: form.baseHp },
														{ label: 'Atk', value: form.baseAttack },
														{ label: 'Def', value: form.baseDefence },
														{ label: 'SpA', value: form.baseSpecialAttack },
														{ label: 'SpD', value: form.baseSpecialDefence },
														{ label: 'Spe', value: form.baseSpeed }
													] as stat (stat.label)}
														<div class="grid grid-cols-12 items-center gap-3">
															<div class="text-muted-foreground col-span-2 text-xs">{stat.label}</div>
															<div class="col-span-8">
																<Progress value={(clamp(stat.value, 0, 255) / 255) * 100} class="h-2" />
															</div>
															<div class="text-foreground col-span-2 text-right text-xs tabular-nums">
																{stat.value}
															</div>
														</div>
													{/each}
												</div>
											</div>
											{#if activePokemon.description}
												<div class="text-muted-foreground bg-background rounded-2xl border p-4 text-sm">
													{activePokemon.description}
												</div>
											{/if}
										</div>
									</div>
								</Card.Content>
							</Card.Root>
							<div class="h-4"></div>
							<div class="space-y-4">
								<Tabs.Root value="moves" class="w-full">
									<Tabs.List class="grid w-full grid-cols-2 rounded-2xl">
										<Tabs.Trigger value="moves">Moves</Tabs.Trigger>
										<Tabs.Trigger value="details">Details</Tabs.Trigger>
									</Tabs.List>

									<Tabs.Content value="moves" class="mt-4">
										<Card.Root class="rounded-2xl">
											<Card.Header class="pb-3">
												<div>
													<Card.Title class="text-base">Moves</Card.Title>
													<div class="text-muted-foreground mt-1 text-sm">Loading moves...</div>
												</div>
											</Card.Header>
											<Card.Content>
												<div class="space-y-2">
													{#each Array(6) as _, i (i)}
														<Skeleton class="h-14 w-full rounded-xl" />
													{/each}
												</div>
											</Card.Content>
										</Card.Root>
									</Tabs.Content>

									<Tabs.Content value="details" class="mt-4">
										<Card.Root class="rounded-2xl">
											<Card.Header class="pb-3">
												<Card.Title class="text-base">Details</Card.Title>
											</Card.Header>
											<Card.Content>
												<div class="grid gap-3 sm:grid-cols-2">
													{#each Array(4) as _, i (i)}
														<Skeleton class="h-20 w-full rounded-xl" />
													{/each}
												</div>
											</Card.Content>
										</Card.Root>
									</Tabs.Content>
								</Tabs.Root>
							</div>
						{:else}
							{@render children()}
						{/if}
					</div>
				</ScrollArea>
			</aside>
		{/key}
	{/if}

	<div class="bg-background border-t">
		<div class="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-xs">
			Peek panel - expand into full-width detail.
		</div>
	</div>
</div>
