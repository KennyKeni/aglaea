export interface GridDataConfig {
  apiEndpoint: string;
  pageSize?: number;
  queryParams?: Record<string, string | boolean>;
  searchParam?: string;
  searchDebounceMs?: number;
}

export interface GridDataState<T> {
  readonly items: T[];
  readonly isLoading: boolean;
  readonly isSearching: boolean;
  readonly searchQuery: string;
  readonly currentPage: number;
  readonly totalPages: number;
  search(query: string): void;
  clearSearch(): void;
  setPage(page: number): void;
  setItems(items: T[]): void;
}

export class GridDataStateImpl<T> implements GridDataState<T> {
  items = $state<T[]>([]);
  isLoading = $state(false);
  isSearching = $state(false);
  searchQuery = $state('');
  currentPage = $state(1);

  #searchResults: T[] | null = null;
  #totalCount: number;
  #searchTimeout: ReturnType<typeof setTimeout> | null = null;
  #config: Required<GridDataConfig>;

  constructor(initialItems: T[], totalCount: number, currentPage: number, config: GridDataConfig) {
    this.items = initialItems ?? [];
    this.#totalCount = totalCount;
    this.currentPage = currentPage;
    this.#config = {
      pageSize: 24,
      queryParams: {},
      searchParam: 'name',
      searchDebounceMs: 300,
      ...config,
    };
  }

  get totalPages(): number {
    return Math.ceil(this.#totalCount / this.#config.pageSize);
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  setItems(items: T[]) {
    if (!this.searchQuery) {
      this.items = items;
    }
  }

  #buildQueryString(params: Record<string, string | number | boolean>): string {
    const allParams = { ...this.#config.queryParams, ...params };
    return Object.entries(allParams)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
  }

  search(query: string) {
    this.searchQuery = query;

    if (this.#searchTimeout) {
      clearTimeout(this.#searchTimeout);
    }

    if (!query.trim()) {
      this.#searchResults = null;
      this.isSearching = false;
      this.items = this.#searchResults ?? this.items;
      return;
    }

    this.isSearching = true;
    this.#searchTimeout = setTimeout(async () => {
      try {
        const qs = this.#buildQueryString({
          [this.#config.searchParam]: query,
          limit: 100,
        });
        const res = await fetch(`${this.#config.apiEndpoint}?${qs}`);
        if (res.ok) {
          const json = await res.json();
          const results: T[] = json.data ?? json;
          this.#searchResults = results;
          this.items = results;
        }
      } finally {
        this.isSearching = false;
      }
    }, this.#config.searchDebounceMs);
  }

  clearSearch() {
    this.searchQuery = '';
    this.#searchResults = null;
    this.isSearching = false;
    if (this.#searchTimeout) {
      clearTimeout(this.#searchTimeout);
    }
  }
}

export function createGridDataState<T>(
  initialItems: T[],
  totalCount: number,
  currentPage: number,
  config: GridDataConfig,
): GridDataState<T> {
  return new GridDataStateImpl(initialItems, totalCount, currentPage, config);
}
