import type { Streamable } from '$lib/utils/streaming';

export interface StreamableState<T> {
	readonly value: T;
	readonly loading: boolean;
	readonly refreshing: boolean;
	resolve(data: Streamable<T>): void;
}

/**
 * Resolves streamable data from server load functions.
 * Tracks loading state for initial load and subsequent refreshes.
 */
export class StreamableResolver<T> implements StreamableState<T> {
	value: T = $state()!;
	loading = $state(true);
	refreshing = $state(false);
	#hasLoadedOnce = false;

	constructor(initialValue: T) {
		this.value = initialValue;
	}

	resolve(data: Streamable<T>) {
		if (data instanceof Promise) {
			if (this.#hasLoadedOnce) {
				this.refreshing = true;
			} else {
				this.loading = true;
			}
			data.then((resolved) => {
				this.value = resolved;
				this.#hasLoadedOnce = true;
				this.loading = false;
				this.refreshing = false;
			});
		} else {
			this.value = data;
			this.#hasLoadedOnce = true;
			this.loading = false;
			this.refreshing = false;
		}
	}
}

export function createStreamableResolver<T>(initialValue: T): StreamableState<T> {
	return new StreamableResolver(initialValue);
}
