import { page, navigating } from '$app/state';
import { goto, preloadData, onNavigate } from '$app/navigation';

export type PanelMode = 'closed' | 'peek' | 'full';

export interface PanelModeState<T> {
	readonly mode: PanelMode;
	readonly focusId: string | null;
	readonly isDetailRoute: boolean;
	readonly isNavigating: boolean;
	readonly activeItem: T | null;
	readonly activeId: string | number | null;
	readonly fullItem: T | null;
	openPeek(item: T): void;
	expand(): void;
	collapse(): void;
	close(): void;
}

export interface PanelModeOptions<T> {
	items: () => T[];
	basePath: string;
	focusParam?: string;
	getId: (item: T) => string | number;
	getFullItemFromPageData?: (pageData: Record<string, unknown>) => T | null;
	isMobile?: () => boolean;
}

export function usePanelMode<T>({
	items,
	basePath,
	focusParam = 'focus',
	getId,
	getFullItemFromPageData,
	isMobile
}: PanelModeOptions<T>): PanelModeState<T> {
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		const fromPath = navigation.from?.url.pathname ?? '';
		const toPath = navigation.to?.url.pathname ?? '';
		const pattern = new RegExp(`${basePath}/(\\d+)`);
		const fromId = fromPath.match(pattern)?.[1];
		const toId = toPath.match(pattern)?.[1];
		const toFocus = navigation.to?.url.searchParams.get(focusParam);

		if ((fromId && toFocus === fromId) || (toId && fromPath === basePath)) {
			return;
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const focusId = $derived(page.url.searchParams.get(focusParam));
	const isDetailRoute = $derived(page.route.id?.includes('[id]') ?? false);
	const isNavigatingToDetail = $derived(navigating?.to?.route.id?.includes('[id]') ?? false);
	const navigatingToId = $derived(isNavigatingToDetail ? navigating?.to?.params?.id : null);

	const mode = $derived<PanelMode>(
		isDetailRoute || isNavigatingToDetail ? 'full' : focusId ? 'peek' : 'closed'
	);

	const focusedItem = $derived(
		focusId ? items().find((item) => String(getId(item)) === focusId) : null
	);

	const navigatingItem = $derived(
		navigatingToId ? items().find((item) => String(getId(item)) === navigatingToId) : null
	);

	const fullItem = $derived.by(() => {
		if (!isDetailRoute || !getFullItemFromPageData) return null;
		return getFullItemFromPageData(page.data as Record<string, unknown>);
	});

	const currentItem = $derived(
		navigatingItem ??
			(isDetailRoute
				? items().find((item) => String(getId(item)) === page.params.id) ?? fullItem
				: focusedItem)
	);

	let cachedItem: T | null = null;
	const activeItem = $derived.by(() => {
		if (currentItem) {
			cachedItem = currentItem;
		}
		return cachedItem;
	});

	const activeId = $derived(activeItem ? getId(activeItem) : null);

	function openPeek(item: T) {
		cachedItem = item;
		const id = getId(item);
		const currentPage = page.url.searchParams.get('page');

		if (isMobile?.()) {
			const url = currentPage ? `${basePath}/${id}?page=${currentPage}` : `${basePath}/${id}`;
			goto(url, { noScroll: true });
		} else {
			const params = new URLSearchParams();
			if (currentPage) params.set('page', currentPage);
			params.set(focusParam, String(id));
			goto(`${basePath}?${params.toString()}`, { noScroll: true });
			preloadData(`${basePath}/${id}`);
		}
	}

	function expand() {
		const id = focusId ?? (cachedItem ? getId(cachedItem) : null);
		if (!id) return;
		const currentPage = page.url.searchParams.get('page');
		const url = currentPage ? `${basePath}/${id}?page=${currentPage}` : `${basePath}/${id}`;
		goto(url, { noScroll: true });
	}

	function collapse() {
		const currentId = page.params.id ?? (cachedItem ? getId(cachedItem) : null);
		if (!currentId) return;
		const currentPage = page.url.searchParams.get('page');
		const params = new URLSearchParams();
		if (currentPage) params.set('page', currentPage);
		params.set(focusParam, String(currentId));
		goto(`${basePath}?${params.toString()}`, { noScroll: true });
	}

	function close() {
		cachedItem = null;
		const currentPage = page.url.searchParams.get('page');
		const targetUrl = currentPage ? `${basePath}?page=${currentPage}` : basePath;
		goto(targetUrl, { noScroll: true });
	}

	return {
		get mode() {
			return mode;
		},
		get focusId() {
			return focusId;
		},
		get isDetailRoute() {
			return isDetailRoute;
		},
		get isNavigating() {
			return isNavigatingToDetail;
		},
		get activeItem() {
			return activeItem;
		},
		get activeId() {
			return activeId;
		},
		get fullItem() {
			return fullItem;
		},
		openPeek,
		expand,
		collapse,
		close
	};
}
