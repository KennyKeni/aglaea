export const ROUTE_BASE = '/pokemon2';
export const FOCUS_PARAM = 'focus';

const detailPathPattern = new RegExp(`^${ROUTE_BASE}/(\\d+)`);

export function getDetailIdFromPath(pathname: string): string | null {
	return pathname.match(detailPathPattern)?.[1] ?? null;
}

export function detailPath(id: number | string): string {
	return `${ROUTE_BASE}/${id}`;
}

export function listPath(focusId?: number | string | null): string {
	if (focusId === undefined || focusId === null || focusId === '') return ROUTE_BASE;
	return `${ROUTE_BASE}?${FOCUS_PARAM}=${encodeURIComponent(String(focusId))}`;
}
