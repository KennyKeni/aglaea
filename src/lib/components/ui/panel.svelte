<script lang="ts">
	import { animate } from 'motion';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { X, Maximize2, Minimize2 } from '@lucide/svelte';
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import type { PanelMode } from '$lib/state/panel-mode.svelte';
	import type { PanelAnimationState } from '$lib/state/panel-animation.svelte';

	let {
		itemKey,
		title,
		subtitle = '',
		badgeLabel = 'Preview',
		mode,
		animation,
		onClose,
		onExpand,
		onCollapse,
		children
	}: {
		itemKey: string | number | null;
		title: string;
		subtitle?: string;
		badgeLabel?: string;
		mode: PanelMode;
		animation: PanelAnimationState;
		onClose: () => void;
		onExpand: () => void;
		onCollapse: () => void;
		children: Snippet;
	} = $props();

	const hasItem = $derived(itemKey !== null && itemKey !== undefined);
	const showPanel = $derived(hasItem || mode === 'full');

	function slideIn(node: HTMLElement) {
		if (!browser) return;
		node.style.transform = 'translateX(100%)';
		requestAnimationFrame(() => {
			animate(node, { transform: 'translateX(0%)' }, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
		});
	}
</script>

{#if animation.showPanel && showPanel}
	{#key itemKey}
		<button
			aria-label="Close panel"
			class="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-200"
			style="opacity: {animation.showOverlay ? 1 : 0}; pointer-events: {animation.showOverlay
				? 'auto'
				: 'none'}"
			onclick={onClose}
		></button>

		<aside
			use:slideIn
			class="bg-background fixed top-0 right-0 z-[70] h-dvh shadow-2xl transition-[width,border-radius,border-left] duration-300 ease-out"
			style="width: {animation.panelWidth}; border-top-left-radius: {animation.borderRadius}; border-left: {animation.borderLeft}"
		>
			<div class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
				<div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
					<div class="flex min-w-0 items-center gap-2">
						<div class="min-w-0 truncate text-sm font-semibold">
							{title}
							{#if subtitle}
								<span class="text-muted-foreground ml-2 text-xs font-normal">{subtitle}</span>
							{/if}
						</div>
						{#if mode === 'peek' && badgeLabel}
							<Badge variant="secondary" class="shrink-0 rounded-full px-2 py-0.5 text-[11px]">
								{badgeLabel}
							</Badge>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						{#if mode === 'peek'}
							<Button variant="secondary" size="sm" onclick={onExpand} class="cursor-pointer">
								<Maximize2 class="mr-2 h-4 w-4" />
								Expand
							</Button>
						{:else if mode === 'full'}
							<Button variant="secondary" size="sm" onclick={onCollapse} class="cursor-pointer">
								<Minimize2 class="mr-2 h-4 w-4" />
								Half
							</Button>
						{/if}
						<Button variant="ghost" size="icon" onclick={onClose} class="cursor-pointer" aria-label="Close">
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
