<script lang="ts">
	import { untrack } from 'svelte';
	import { ArticleContent } from '$lib/components/articles';
	import EntityPanelLayout from '$lib/components/ui/entity-panel-layout.svelte';
	import { createArticleState } from '$lib/state/article-data.svelte';
	import { createPanelMode } from '$lib/state/panel-mode.svelte';
	import { createPanelAnimation } from '$lib/state/panel-animation.svelte';
	import { setArticleDataContext, setArticlePanelContext } from '$lib/context/articles';
	import type { Article } from '$lib/types/article';

	interface LayoutData {
		totalCount: number;
		pageSize: number;
	}

	let { data, children }: { data: LayoutData; children: any } = $props();

	const articleData = untrack(() => createArticleState([], data?.totalCount ?? 0, 1));
	setArticleDataContext(articleData);

	let isMobileState = $state(false);

	const panelMode = createPanelMode<Article>({
		items: () => articleData.items,
		basePath: '/articles',
		getId: (item) => item.id,
		getFullItemFromPageData: (pageData: Record<string, unknown>) => {
			const dataArticle = pageData?.article;
			if (dataArticle && typeof dataArticle === 'object' && 'id' in dataArticle) {
				return dataArticle as Article;
			}
			return null;
		},
		isMobile: () => isMobileState
	});

	const panelAnimation = createPanelAnimation(
		() => panelMode.mode,
		() => panelMode.isNavigating
	);

	$effect(() => {
		isMobileState = panelAnimation.isMobile;
	});

	setArticlePanelContext({ mode: panelMode, animation: panelAnimation });

	const panelTitle = $derived(panelMode.activeItem?.title ?? '');
	const panelSubtitle = $derived(panelMode.activeItem?.author ? `By ${panelMode.activeItem.author}` : '');
</script>

<EntityPanelLayout
	{panelMode}
	{panelAnimation}
	title={panelTitle}
	subtitle={panelSubtitle}
	footer="Articles from the community."
>
	{#snippet children()}
		{@render children()}
	{/snippet}

	{#snippet peekContent()}
		{#if panelMode.activeItem}
			<ArticleContent
				article={panelMode.activeItem}
				mode={panelMode.isNavigating ? 'loading' : 'peek'}
				onExpand={panelMode.expand}
			/>
		{/if}
	{/snippet}
</EntityPanelLayout>
