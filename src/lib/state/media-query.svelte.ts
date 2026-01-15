import { MediaQuery } from 'svelte/reactivity';
import { onMount } from 'svelte';

const DEFAULT_MOBILE_BREAKPOINT = 768;

export class IsMobile extends MediaQuery {
	constructor(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		super(`(max-width: ${breakpoint - 1}px)`);
	}
}

export function createMediaQuery(query: string) {
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
