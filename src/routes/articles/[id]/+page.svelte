<script lang="ts">
	import { ArticleContent, ArticleEditor } from '$lib/components/articles';
	import { Button } from '$lib/components/ui/button';
	import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
	import { Pencil } from '@lucide/svelte';
	import type { Article } from '$lib/types/article';
	import type { TocItem } from '$lib/utils/toc';

	let { data }: { data: { article: Article; toc: TocItem[] } } = $props();

	let article: Article = $state(null!);
	let toc: TocItem[] = $state([]);
	let isEditing = $state(false);

	$effect(() => {
		article = data.article;
		toc = data.toc;
		isEditing = false;
	});

	function handleSave(updated: Article) {
		article = updated;
		isEditing = false;
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	{#if !article}
		<LoadingSpinner class="py-20" />
	{:else if isEditing}
		<ArticleEditor
			initialTitle={article.title}
			initialSubtitle={article.subtitle ?? ''}
			initialDescription={article.description ?? ''}
			initialAuthor={article.author ?? ''}
			initialBody={article.body}
			editMeta={{
				id: String(article.id),
				createdAt: article.createdAt,
				categories: article.categories,
				images: article.images
			}}
			onSave={handleSave}
			onCancel={() => (isEditing = false)}
		/>
	{:else}
		<div class="flex justify-end mb-6">
			<Button variant="ghost" size="sm" onclick={() => (isEditing = true)}>
				<Pencil class="mr-2 h-4 w-4" />
				Edit
			</Button>
		</div>
		<ArticleContent {article} {toc} mode="full" />
	{/if}
</div>
