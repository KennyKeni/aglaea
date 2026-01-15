import { onMount } from 'svelte';
import type { PanelMode } from './panel-mode.svelte';

export interface PanelAnimationState {
	readonly showPanel: boolean;
	readonly showOverlay: boolean;
	readonly panelWidth: string;
	readonly borderRadius: string;
	readonly borderLeft: string;
	readonly isMobile: boolean;
}

export function createPanelAnimation(
	getMode: () => PanelMode,
	getIsNavigating: () => boolean
): PanelAnimationState {
	let isMd = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		isMd = mq.matches;
		const handler = (e: MediaQueryListEvent) => (isMd = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	const mode = $derived(getMode());
	const isNavigating = $derived(getIsNavigating());

	const showPanel = $derived(mode !== 'closed' || isNavigating);
	const showOverlay = $derived(mode === 'peek' && !isNavigating);
	const peekWidth = $derived(isMd ? '50vw' : '100vw');
	const panelWidth = $derived(mode === 'full' ? '100vw' : peekWidth);
	const borderRadius = $derived(mode === 'full' ? '0px' : '28px');
	const borderLeft = $derived(mode === 'peek' ? '1px solid hsl(var(--border))' : 'none');

	return {
		get showPanel() {
			return showPanel;
		},
		get showOverlay() {
			return showOverlay;
		},
		get panelWidth() {
			return panelWidth;
		},
		get borderRadius() {
			return borderRadius;
		},
		get borderLeft() {
			return borderLeft;
		},
		get isMobile() {
			return !isMd;
		}
	};
}
