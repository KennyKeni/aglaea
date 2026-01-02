import { onMount } from 'svelte';

export function useMediaQuery(query: string) {
	let matches = $state(false);

	onMount(() => {
		const mq = window.matchMedia(query);
		matches = mq.matches;
		const handler = (e: MediaQueryListEvent) => (matches = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	return {
		get matches() {
			return matches;
		}
	};
}
