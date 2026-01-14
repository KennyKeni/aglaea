<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SearchHeader, ArticleGrid } from '$lib/components/articles';
	import Pagination from '$lib/components/ui/pagination.svelte';
	import { getArticleDataContext, getArticlePanelContext } from '$lib/context/articles';
	import type { Article } from '$lib/types/article';

	interface PageData {
		articles: Article[];
		currentPage: number;
		totalCount: number;
		pageSize: number;
	}

	let { data }: { data: PageData } = $props();

	const articleData = getArticleDataContext();
	const { mode: panelMode } = getArticlePanelContext();

	$effect(() => {
		if (!articleData.searchQuery) {
			articleData.setItems(data.articles);
			articleData.setPage(data.currentPage);
		}
	});

	let query = $state(page.url.searchParams.get('search') || '');

	function handleSearch(nextQuery: string) {
		query = nextQuery;
		articleData.search(nextQuery);

		const params = new URLSearchParams(page.url.searchParams);
		if (nextQuery.trim()) {
			params.set('search', nextQuery);
			params.delete('page');
		} else {
			params.delete('search');
		}
		const queryString = params.toString();
		history.replaceState({}, '', queryString ? `/articles?${queryString}` : '/articles');
	}

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(newPage));
		goto(`/articles?${params.toString()}`, { keepFocus: true });
	}
</script>

<SearchHeader
	{query}
	onQueryChange={handleSearch}
	count={articleData.items.length}
	totalLoaded={data.articles.length}
	isSearching={articleData.isSearching}
/>

<ArticleGrid
	articles={articleData.items}
	isLoading={false}
	onCardClick={(article) => panelMode.openPeek(article)}
/>

{#if !articleData.searchQuery && data.totalCount > 0}
	<div class="mx-auto max-w-6xl px-4 pb-8">
		<Pagination
			currentPage={data.currentPage}
			totalPages={Math.ceil(data.totalCount / data.pageSize)}
			onPageChange={handlePageChange}
		/>
	</div>
{/if}
