<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ArticleGrid, ArticleEditor } from '$lib/components/articles';
	import Pagination from '$lib/components/ui/pagination.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
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

	let isCreating = $state(false);

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

	function handleCreate(article: Article) {
		isCreating = false;
		goto(`/articles/${article.id}`);
	}
</script>

{#if isCreating}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<ArticleEditor onSave={handleCreate} onCancel={() => (isCreating = false)} />
	</div>
{:else}
	<div class="mx-auto max-w-6xl px-4 py-4">
		<div class="flex justify-end">
			<Button onclick={() => (isCreating = true)}>
				<Plus class="mr-2 h-4 w-4" />
				New Article
			</Button>
		</div>
	</div>

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
{/if}
