import type { Pokemon } from '$lib/types/pokemon';

const PAGE_SIZE = 48;

export class PokemonDataState {
	items = $state<Pokemon[]>([]);
	isLoading = $state(false);
	isSearching = $state(false);
	searchQuery = $state('');
	totalLoaded = $state(0);
	hasMore = $state(true);

	#allLoaded: Pokemon[] = [];
	#searchResults: Pokemon[] | null = null;
	#offset = 0;
	#totalCount: number;
	#searchTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor(initialPokemon: Pokemon[], totalCount: number) {
		this.#allLoaded = initialPokemon;
		this.#offset = initialPokemon.length;
		this.#totalCount = totalCount;
		this.#updateState();
	}

	#updateState() {
		this.hasMore = this.#offset < this.#totalCount && !this.searchQuery;
		this.items = this.#searchResults ?? this.#filterLocal(this.#allLoaded, this.searchQuery);
		this.totalLoaded = this.#allLoaded.length;
	}

	#filterLocal(pokemon: Pokemon[], query: string): Pokemon[] {
		if (!query.trim()) return pokemon;
		const q = query.trim().toLowerCase();
		return pokemon.filter(
			(p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q)
		);
	}

	async loadMore() {
		if (this.isLoading || !this.hasMore) return;

		this.isLoading = true;
		try {
			const res = await fetch(
				`/api/pokemon?limit=${PAGE_SIZE}&offset=${this.#offset}&includeTypes=true&includeAbilities=true`
			);
			if (res.ok) {
				const newPokemon: Pokemon[] = await res.json();
				this.#allLoaded = [...this.#allLoaded, ...newPokemon];
				this.#offset += newPokemon.length;
				this.#updateState();
			}
		} finally {
			this.isLoading = false;
		}
	}

	search(query: string) {
		this.searchQuery = query;

		if (this.#searchTimeout) {
			clearTimeout(this.#searchTimeout);
		}

		if (!query.trim()) {
			this.#searchResults = null;
			this.isSearching = false;
			this.#updateState();
			return;
		}

		const localResults = this.#filterLocal(this.#allLoaded, query);
		if (localResults.length >= 10 || this.#allLoaded.length >= this.#totalCount) {
			this.#searchResults = null;
			this.isSearching = false;
			this.#updateState();
			return;
		}

		this.isSearching = true;
		this.#searchTimeout = setTimeout(async () => {
			try {
				const res = await fetch(
					`/api/pokemon?search=${encodeURIComponent(query)}&limit=100&includeTypes=true&includeAbilities=true`
				);
				if (res.ok) {
					this.#searchResults = await res.json();
					this.#updateState();
				}
			} finally {
				this.isSearching = false;
			}
		}, 300);
	}

	clearSearch() {
		this.searchQuery = '';
		this.#searchResults = null;
		this.isSearching = false;
		if (this.#searchTimeout) {
			clearTimeout(this.#searchTimeout);
		}
		this.#updateState();
	}

	setupInfiniteScroll(sentinel: HTMLElement): () => void {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && this.hasMore && !this.isLoading) {
					this.loadMore();
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}
}

export function usePokemonData(
	initialPokemon: Pokemon[],
	totalCount: number
): PokemonDataState {
	return new PokemonDataState(initialPokemon, totalCount);
}
