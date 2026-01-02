<script lang="ts">
	import { animate } from 'motion';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { X, Maximize2, Minimize2 } from '@lucide/svelte';
	import { browser } from '$app/environment';
	import type { Action } from 'svelte/action';
	import type { Snippet } from 'svelte';
	import type { PanelState } from '$lib/hooks/use-panel-state.svelte';
	import { formatId } from '$lib/types/pokemon';

	let {
		panel,
		children
	}: {
		panel: PanelState;
		children: Snippet;
	} = $props();

	let hasHydrated = $state(false);
	$effect(() => {
		if (browser) hasHydrated = true;
	});

	const slideIn: Action<HTMLElement> = (node) => {
		if (!hasHydrated) return;
		node.style.transform = 'translateX(100%)';
		requestAnimationFrame(() => {
			animate(node, { transform: 'translateX(0%)' }, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
		});
	};
</script>

{#if panel.showPanel && panel.activePokemon}
	{#key panel.activePokemon.id}
		<button
			aria-label="Close panel"
			class="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200"
			style="opacity: {panel.showOverlay ? 1 : 0}; pointer-events: {panel.showOverlay
				? 'auto'
				: 'none'}"
			onclick={panel.close}
		></button>

		<aside
			use:slideIn
			class="bg-background fixed top-0 right-0 z-40 h-dvh shadow-2xl transition-[width,border-radius,border-left] duration-300 ease-out"
			style="width: {panel.panelWidth}; border-top-left-radius: {panel.panelBorderRadius}; border-left: {panel.panelBorderLeft}"
		>
			<div class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
				<div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
					<div class="flex min-w-0 items-center gap-2">
						<div class="truncate text-sm font-semibold">
							{panel.activePokemon.name}
							{formatId(panel.activePokemon.id)}
						</div>
						{#if panel.mode === 'peek'}
							<Badge variant="secondary" class="shrink-0 rounded-full px-2 py-0.5 text-[11px]">
								Preview
							</Badge>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						{#if panel.mode === 'peek'}
							<Button variant="secondary" size="sm" onclick={panel.expand}>
								<Maximize2 class="mr-2 h-4 w-4" />
								Expand
							</Button>
						{:else if panel.mode === 'full'}
							<Button variant="secondary" size="sm" onclick={panel.collapse}>
								<Minimize2 class="mr-2 h-4 w-4" />
								Half
							</Button>
						{/if}
						<Button variant="ghost" size="icon" onclick={panel.close} aria-label="Close">
							<X class="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<ScrollArea class="h-[calc(100dvh-56px)]">
				<div class="px-4 py-4 md:px-6 md:py-6">
					{@render children()}
				</div>
			</ScrollArea>
		</aside>
	{/key}
{/if}
