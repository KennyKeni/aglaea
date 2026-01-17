<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ArticleGrid } from '$lib/components/articles';
	import Pagination from '$lib/components/ui/pagination.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { getArticleDataContext, getArticlePanelContext } from '$lib/context/articles';
	import { can } from '$lib/state/permissions.svelte';
	import { Resource, Action } from '$lib/types/auth';
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

	$effect(() => {
		const query = page.url.searchParams.get('search') || '';
		articleData.search(query);
	});

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(newPage));
		goto(`/articles?${params.toString()}`, { keepFocus: true });
	}
</script>

{#if can(Resource.Article, Action.Create)}
	<div class="mx-auto max-w-6xl px-4 py-4">
		<div class="flex justify-end">
			<Button href="/articles/new">
				<Plus class="mr-2 h-4 w-4" />
				New Article
			</Button>
		</div>
	</div>
{/if}

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
