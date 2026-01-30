<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Search } from '@lucide/svelte';

	const basePath = '/abilities';

	let searchValue = $state(page.url.searchParams.get('search') ?? '');

	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleSearch(value: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const params = new URLSearchParams(page.url.searchParams);
			if (value) {
				params.set('search', value);
			} else {
				params.delete('search');
			}
			params.delete('page');
			goto(`${basePath}?${params.toString()}`, { keepFocus: true });
		}, 300);
	}
</script>

<div class="flex items-center gap-2 py-2">
	<div class="relative w-full max-w-sm">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search abilities..."
			class="pl-9"
			bind:value={searchValue}
			oninput={() => handleSearch(searchValue)}
		/>
	</div>
</div>
