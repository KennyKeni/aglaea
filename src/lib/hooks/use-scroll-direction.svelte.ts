import { browser } from '$app/environment';

export type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection(threshold = 10) {
	let direction = $state<ScrollDirection>(null);
	let lastScrollY = $state(0);

	$effect(() => {
		if (!browser) return;

		function handleScroll() {
			const currentScrollY = window.scrollY;
			const diff = currentScrollY - lastScrollY;

			if (Math.abs(diff) < threshold) return;

			direction = diff > 0 ? 'down' : 'up';
			lastScrollY = currentScrollY;
		}

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	return {
		get direction() {
			return direction;
		},
		get isScrollingDown() {
			return direction === 'down';
		},
		get isScrollingUp() {
			return direction === 'up';
		}
	};
}
