<script lang="ts">
	import { untrack } from 'svelte';
	import { Panel, ArticleContent } from '$lib/components/articles';
	import { createArticleState } from '$lib/states/article-state.svelte';
	import { usePanelMode } from '$lib/hooks/use-panel-mode.svelte';
	import { usePanelAnimation } from '$lib/hooks/use-panel-animation.svelte';
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

	const panelMode = usePanelMode<Article>({
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

	const panelAnimation = usePanelAnimation(
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

<div class="bg-muted/30 min-h-screen">
	<div class:hidden={panelMode.isDetailRoute}>
		{@render children()}
	</div>

	<Panel
		itemKey={panelMode.activeId}
		title={panelTitle}
		subtitle={panelSubtitle}
		animation={panelAnimation}
		onClose={panelMode.close}
		onExpand={panelMode.expand}
		onCollapse={panelMode.collapse}
		mode={panelMode.mode}
	>
		{#if panelMode.isDetailRoute}
			{@render children()}
		{:else if panelMode.activeItem}
			<ArticleContent
				article={panelMode.activeItem}
				mode={panelMode.isNavigating ? 'loading' : 'peek'}
				onExpand={panelMode.expand}
			/>
		{/if}
	</Panel>

	<div class="bg-background border-t">
		<div class="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-xs">
			Articles from the community.
		</div>
	</div>
</div>
