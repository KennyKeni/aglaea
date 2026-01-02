import { page, navigating } from '$app/state';
import { goto, preloadData, onNavigate } from '$app/navigation';
import { onMount } from 'svelte';
import type { Pokemon } from '$lib/types/pokemon';

export interface PanelState {
	readonly mode: 'closed' | 'peek' | 'full';
	readonly showPanel: boolean;
	readonly showOverlay: boolean;
	readonly isLoading: boolean;
	readonly panelWidth: string;
	readonly panelBorderRadius: string;
	readonly panelBorderLeft: string;
	readonly activePokemon: Pokemon | null;
	openPeek(mon: Pokemon): void;
	expand(): void;
	collapse(): void;
	close(): void;
}

export function usePanelState(getPokemonList: () => Pokemon[]): PanelState {
	let isMd = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		isMd = mq.matches;
		const handler = (e: MediaQueryListEvent) => (isMd = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		const fromPath = navigation.from?.url.pathname ?? '';
		const toPath = navigation.to?.url.pathname ?? '';
		const fromId = fromPath.match(/\/pokemon3\/(\d+)/)?.[1];
		const toId = toPath.match(/\/pokemon3\/(\d+)/)?.[1];
		const toFocus = navigation.to?.url.searchParams.get('focus');

		if ((fromId && toFocus === fromId) || (toId && fromPath === '/pokemon3')) {
			return;
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const focusId = $derived(page.url.searchParams.get('focus'));
	const isDetailRoute = $derived(page.route.id?.includes('[id]') ?? false);
	const focusedPokemon = $derived(
		focusId ? getPokemonList().find((p) => String(p.id) === focusId) : null
	);

	const isNavigatingToDetail = $derived(navigating?.to?.route.id?.includes('[id]') ?? false);
	const navigatingToId = $derived(isNavigatingToDetail ? navigating?.to?.params?.id : null);
	const navigatingToPokemon = $derived(
		navigatingToId ? getPokemonList().find((p) => String(p.id) === navigatingToId) : null
	);

	const mode = $derived<'closed' | 'peek' | 'full'>(
		isDetailRoute || isNavigatingToDetail ? 'full' : focusId ? 'peek' : 'closed'
	);
	const showPanel = $derived(mode !== 'closed' || isNavigatingToDetail);
	const peekWidth = $derived(isMd ? '50vw' : '100vw');
	const panelWidth = $derived(mode === 'full' ? '100vw' : peekWidth);
	const panelBorderRadius = $derived(mode === 'full' ? '0px' : '28px');
	const panelBorderLeft = $derived(
		mode === 'peek' ? '1px solid hsl(var(--border))' : 'none'
	);
	const showOverlay = $derived(mode === 'peek' && !isNavigatingToDetail);
	const isLoading = $derived(isNavigatingToDetail);

	const currentPokemon = $derived(
		navigatingToPokemon ??
			(isDetailRoute
				? getPokemonList().find((p) => String(p.id) === page.params.id)
				: focusedPokemon)
	);

	let cachedPokemon: Pokemon | null = null;
	const activePokemon = $derived.by(() => {
		if (currentPokemon) {
			cachedPokemon = currentPokemon;
		}
		return cachedPokemon;
	});

	function openPeek(mon: Pokemon) {
		goto(`/pokemon3?focus=${mon.id}`, { noScroll: true });
		preloadData(`/pokemon3/${mon.id}`);
	}

	function expand() {
		if (!focusId) return;
		goto(`/pokemon3/${focusId}`, { noScroll: true });
	}

	function collapse() {
		if (!isDetailRoute) return;
		const currentId = page.params.id;
		goto(`/pokemon3?focus=${currentId}`, { noScroll: true });
	}

	function close() {
		goto('/pokemon3', { noScroll: true });
	}

	return {
		get mode() {
			return mode;
		},
		get showPanel() {
			return showPanel;
		},
		get showOverlay() {
			return showOverlay;
		},
		get isLoading() {
			return isLoading;
		},
		get panelWidth() {
			return panelWidth;
		},
		get panelBorderRadius() {
			return panelBorderRadius;
		},
		get panelBorderLeft() {
			return panelBorderLeft;
		},
		get activePokemon() {
			return activePokemon;
		},
		openPeek,
		expand,
		collapse,
		close
	};
}
