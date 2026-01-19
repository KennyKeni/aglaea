export type Streamable<T> = T | Promise<T>;

/**
 * Conditionally awaits based on request type.
 * - SSR (isDataRequest=false): awaits for full HTML
 * - Client nav (isDataRequest=true): returns promise for streaming
 */
export async function streamOnNav<T>(
	promise: Promise<T>,
	isDataRequest: boolean
): Promise<Streamable<T>> {
	return isDataRequest ? promise : await promise;
}
