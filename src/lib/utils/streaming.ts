export type Streamable<T> = T | Promise<T>;

/**
 * Maps a streamable value through a transform function.
 * Handles both resolved values and promises transparently.
 */
export function streamMap<T, R>(
	streamable: Streamable<T>,
	fn: (value: T) => R
): Streamable<R> {
	return streamable instanceof Promise ? streamable.then(fn) : fn(streamable);
}

/**
 * Conditionally awaits a promise based on request type.
 * - SSR (isDataRequest=false): awaits for full HTML
 * - Client nav (isDataRequest=true): returns promise for streaming
 */
export async function streamOnNav<T>(
	promise: Promise<T>,
	isDataRequest: boolean
): Promise<Streamable<T>> {
	return isDataRequest ? promise : await promise;
}
