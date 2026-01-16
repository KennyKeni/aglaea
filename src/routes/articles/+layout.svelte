<script lang="ts">
	import { ArticleContent } from '$lib/components/articles';
	import EntityLayout from '$lib/components/ui/entity-layout.svelte';
	import { createArticleState } from '$lib/state/article-data.svelte';
	import { setArticleDataContext, setArticlePanelContext } from '$lib/context/articles';
	import type { Article } from '$lib/types/article';

	let { data, children: content }: { data: { totalCount: number; pageSize: number }; children: any } =
		$props();
</script>

<EntityLayout
	{data}
	basePath="/articles"
	pageDataKey="article"
	footer="Articles from the community."
	createState={(totalCount) => createArticleState([], totalCount, 1)}
	setDataContext={setArticleDataContext}
	setPanelContext={setArticlePanelContext}
	getTitle={(item: Article) => item.title}
	getSubtitle={(item: Article) => (item.author ? `By ${item.author}` : '')}
>
	{#snippet children()}
		{@render content()}
	{/snippet}

	{#snippet renderPeekContent(item: Article)}
		<ArticleContent article={item} mode="peek" />
	{/snippet}
</EntityLayout>
