export function useCached<T>(getValue: () => T | null | undefined): { readonly value: T | null } {
	let cached: T | null = null;

	const value = $derived.by(() => {
		const current = getValue();
		if (current != null) {
			cached = current;
		}
		return cached;
	});

	return {
		get value() {
			return value;
		}
	};
}
