export interface GridDataConfig {
  apiEndpoint: string;
  pageSize?: number;
  queryParams?: Record<string, string | boolean>;
}

export interface GridDataState<T> {
  readonly items: T[];
  readonly isLoading: boolean;
  readonly currentPage: number;
  readonly totalPages: number;
  setPage(page: number): void;
  setItems(items: T[]): void;
  setListParams(params: URLSearchParams): void;
  getReturnHref(basePath: string): string;
}

export class GridDataStateImpl<T> implements GridDataState<T> {
  items = $state<T[]>([]);
  isLoading = $state(false);
  currentPage = $state(1);

  #totalCount: number;
  #config: Required<GridDataConfig>;
  #listParams: URLSearchParams = new URLSearchParams();

  constructor(initialItems: T[], totalCount: number, currentPage: number, config: GridDataConfig) {
    this.items = initialItems ?? [];
    this.#totalCount = totalCount;
    this.currentPage = currentPage;
    this.#config = {
      pageSize: 24,
      queryParams: {},
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
    this.items = items;
  }

  setListParams(params: URLSearchParams) {
    this.#listParams = new URLSearchParams(params);
  }

  getReturnHref(basePath: string): string {
    const qs = this.#listParams.toString();
    return qs ? `${basePath}?${qs}` : basePath;
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
