<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from './panel.svelte';
	import type { PanelModeState } from '$lib/state/panel-mode.svelte';
	import type { PanelAnimationState } from '$lib/state/panel-animation.svelte';

	let {
		panelMode,
		panelAnimation,
		title,
		subtitle = '',
		badgeLabel = 'Preview',
		children,
		peekContent,
		footer
	}: {
		panelMode: PanelModeState<unknown>;
		panelAnimation: PanelAnimationState;
		title: string;
		subtitle?: string;
		badgeLabel?: string;
		children: Snippet;
		peekContent?: Snippet;
		footer?: Snippet | string;
	} = $props();
</script>

<div class="bg-muted/30 flex min-h-screen flex-col">
	<div class="flex-1">
		{#if !panelMode.isDetailRoute}
			<div>
				{@render children()}
			</div>
		{/if}

		<Panel
			itemKey={panelMode.activeId}
			{title}
			{subtitle}
			{badgeLabel}
			animation={panelAnimation}
			onClose={panelMode.close}
			onExpand={panelMode.expand}
			onCollapse={panelMode.collapse}
			mode={panelMode.mode}
		>
			{#if panelMode.isDetailRoute}
				{@render children()}
			{:else if panelMode.activeItem && peekContent}
				{@render peekContent()}
			{/if}
		</Panel>
	</div>

	{#if footer}
		<div class="bg-background border-t">
			<div class="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-xs">
				{#if typeof footer === 'string'}
					{footer}
				{:else}
					{@render footer()}
				{/if}
			</div>
		</div>
	{/if}
</div>
