import { browser } from '$app/environment';

interface ThemeStore {
	mode: 'light' | 'dark' | 'system';
	isDark: boolean;
	toggle(): void;
}

function createThemeStore(): ThemeStore {
	let mode = $state<'light' | 'dark' | 'system'>('system');
	let isDark = $state(false);

	if (browser) {
		const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
		mode = stored ?? 'system';
		isDark = document.documentElement.classList.contains('dark');

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (mode === 'system') {
				isDark = e.matches;
				document.documentElement.classList.toggle('dark', isDark);
			}
		});
	}

	function apply(theme: 'light' | 'dark' | 'system') {
		if (!browser) return;

		const dark =
			theme === 'dark' ||
			(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

		isDark = dark;
		document.documentElement.classList.toggle('dark', dark);

		if (theme === 'system') {
			localStorage.removeItem('theme');
		} else {
			localStorage.setItem('theme', theme);
		}
	}

	return {
		get mode() {
			return mode;
		},
		set mode(value: 'light' | 'dark' | 'system') {
			mode = value;
			apply(value);
		},
		get isDark() {
			return isDark;
		},
		toggle() {
			this.mode = isDark ? 'light' : 'dark';
		}
	};
}

export const theme = createThemeStore();
