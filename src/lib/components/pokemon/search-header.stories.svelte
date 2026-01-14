<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SearchHeader from './search-header.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Pokemon/SearchHeader',
		component: SearchHeader,
		tags: ['autodocs'],
		args: {
			onQueryChange: fn()
		}
	});
</script>

<Story name="Default" args={{ query: '', count: 1025, totalLoaded: 48 }} />

<Story name="With Search Query" args={{ query: 'pika', count: 5, totalLoaded: 48 }} />

<Story name="Searching" args={{ query: 'char', count: 0, totalLoaded: 48, isSearching: true }} />

<Story name="No Results" args={{ query: 'asdfghjkl', count: 0, totalLoaded: 48 }} />

<Story name="All Loaded" args={{ query: '', count: 1025, totalLoaded: 1025 }} />
