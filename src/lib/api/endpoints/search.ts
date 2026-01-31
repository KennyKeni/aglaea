import { client } from '../client';
import type { Paginated } from '$lib/types/base';
import type { SearchResult, SearchSource, SearchSourceKind } from '$lib/types/search';

interface PaginatedItem {
	id: number;
	name: string;
	slug: string;
	[key: string]: unknown;
}

async function fetchResults(
	path: string,
	queryParam: string,
	query: string,
	limit: number,
	source: SearchSourceKind,
	extra?: string,
): Promise<SearchResult[]> {
	const params = new URLSearchParams();
	params.set(queryParam, query);
	params.set('limit', String(limit));
	if (extra) params.set(extra, 'true');

	const result = await client.get<Paginated<PaginatedItem>>(`${path}?${params}`);
	if (!result.ok) return [];

	return result.data.data.map((item) => ({
		id: item.id,
		name: item.name,
		slug: item.slug,
		source,
		raw: item,
	}));
}

export function searchPokemon(query: string, limit: number): Promise<SearchResult[]> {
	return fetchResults('/pokemon', 'name', query, limit, 'pokemon', 'includeTypes');
}

export function searchMoves(query: string, limit: number): Promise<SearchResult[]> {
	return fetchResults('/moves', 'name', query, limit, 'moves');
}

export function searchAbilities(query: string, limit: number): Promise<SearchResult[]> {
	return fetchResults('/abilities', 'name', query, limit, 'abilities');
}

export function searchTypes(query: string, limit: number): Promise<SearchResult[]> {
	return fetchResults('/types', 'name', query, limit, 'types');
}

export function searchItems(query: string, limit: number): Promise<SearchResult[]> {
	return fetchResults('/items', 'name', query, limit, 'items');
}

export function searchArticles(query: string, limit: number): Promise<SearchResult[]> {
	return fetchResults('/articles', 'title', query, limit, 'articles');
}

export const allSearchSources: SearchSource[] = [
	{ kind: 'pokemon', label: 'Pokemon', search: searchPokemon },
	{ kind: 'moves', label: 'Moves', search: searchMoves },
	{ kind: 'abilities', label: 'Abilities', search: searchAbilities },
	{ kind: 'types', label: 'Types', search: searchTypes },
	{ kind: 'items', label: 'Items', search: searchItems },
	{ kind: 'articles', label: 'Articles', search: searchArticles },
];

export function getSearchSources(kinds: SearchSourceKind[]): SearchSource[] {
	return allSearchSources.filter((s) => kinds.includes(s.kind));
}
