export type SearchSourceKind = 'pokemon' | 'moves' | 'abilities' | 'types' | 'items' | 'articles';

export interface SearchResult {
	id: number;
	name: string;
	slug: string;
	source: SearchSourceKind;
	meta?: Record<string, string>;
	raw?: unknown;
}

export interface SearchGroup {
	source: SearchSourceKind;
	label: string;
	results: SearchResult[];
	loading: boolean;
}

export interface SearchSource {
	kind: SearchSourceKind;
	label: string;
	search: (query: string, limit: number) => Promise<SearchResult[]>;
}
