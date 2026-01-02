import type { Pokemon } from '$lib/types/pokemon';

const PAGE_SIZE = 50;

export interface PokemonDataState {
	readonly items: Pokemon[];
	readonly isLoading: boolean;
	readonly hasMore: boolean;
	readonly isSearching: boolean;
	readonly searchQuery: string;
	readonly totalLoaded: number;
	loadMore(): Promise<void>;
	search(query: string): void;
	clearSearch(): void;
}

export function usePokemonData(
	initialPokemon: Pokemon[],
	totalCount: number
): PokemonDataState {
	let allLoaded = $state<Pokemon[]>(initialPokemon);
	let searchResults = $state<Pokemon[] | null>(null);
	let isLoading = $state(false);
	let isSearching = $state(false);
	let searchQuery = $state('');
	let offset = $state(initialPokemon.length);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	const hasMore = $derived(offset < totalCount && !searchQuery);
	const items = $derived(searchResults ?? filterLocal(allLoaded, searchQuery));
	const totalLoaded = $derived(allLoaded.length);

	function filterLocal(pokemon: Pokemon[], query: string): Pokemon[] {
		if (!query.trim()) return pokemon;
		const q = query.trim().toLowerCase();
		return pokemon.filter(
			(p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q)
		);
	}

	async function loadMore() {
		if (isLoading || !hasMore) return;

		isLoading = true;
		try {
			const res = await fetch(
				`/api/pokemon/search?limit=${PAGE_SIZE}&offset=${offset}&includeTypes=true&includeAbilities=true`
			);
			if (res.ok) {
				const newPokemon: Pokemon[] = await res.json();
				allLoaded = [...allLoaded, ...newPokemon];
				offset += newPokemon.length;
			}
		} finally {
			isLoading = false;
		}
	}

	function search(query: string) {
		searchQuery = query;

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		if (!query.trim()) {
			searchResults = null;
			isSearching = false;
			return;
		}

		// If query matches loaded data well, use local filter
		const localResults = filterLocal(allLoaded, query);
		if (localResults.length >= 10 || allLoaded.length >= totalCount) {
			searchResults = null; // Use local filter via derived
			isSearching = false;
			return;
		}

		// Otherwise, search API after debounce
		isSearching = true;
		searchTimeout = setTimeout(async () => {
			try {
				const res = await fetch(
					`/api/pokemon/search?search=${encodeURIComponent(query)}&limit=100&includeTypes=true&includeAbilities=true`
				);
				if (res.ok) {
					searchResults = await res.json();
				}
			} finally {
				isSearching = false;
			}
		}, 300);
	}

	function clearSearch() {
		searchQuery = '';
		searchResults = null;
		isSearching = false;
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
	}

	return {
		get items() {
			return items;
		},
		get isLoading() {
			return isLoading;
		},
		get hasMore() {
			return hasMore;
		},
		get isSearching() {
			return isSearching;
		},
		get searchQuery() {
			return searchQuery;
		},
		get totalLoaded() {
			return totalLoaded;
		},
		loadMore,
		search,
		clearSearch
	};
}
