<svelte:head>
  <title>Articles | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { ArticleGrid, ArticleFilters } from '$lib/components/articles';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Plus } from '@lucide/svelte';
  import { getArticleDataContext, getArticlePanelContext } from '$lib/context/articles';
  import { StreamableResolver } from '$lib/state/streamable.svelte';
  import { can } from '$lib/state/permissions.svelte';
  import { Resource, Action } from '$lib/types/auth';
  import type { Article } from '$lib/types/article';
  import type { FilterOption } from '$lib/utils/filters';
  import type { Streamable } from '$lib/utils/streaming';

  interface PageData {
    articles: Streamable<Article[]>;
    filteredCount: Streamable<number>;
    currentPage: number;
    totalCount: number;
    pageSize: number;
    categories: FilterOption[];
  }

  let { data }: { data: PageData } = $props();

  const articleData = getArticleDataContext();
  const { mode: panelMode } = getArticlePanelContext();

  const articles = new StreamableResolver<Article[]>([]);
  const filteredCount = new StreamableResolver<number>(0);

  $effect(() => {
    articles.resolve(data.articles);
  });

  $effect(() => {
    if (!articles.loading && !articleData.searchQuery) {
      articleData.setItems(articles.value);
      articleData.setPage(data.currentPage);
    }
  });

  $effect(() => {
    filteredCount.resolve(data.filteredCount);
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

<div class="mx-auto max-w-6xl px-4 pt-4">
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <ArticleFilters categories={data.categories} />
    </div>
    {#if can(Resource.Article, Action.Create)}
      <Button href="/articles/new">
        <Plus class="mr-2 h-4 w-4" />
        New Article
      </Button>
    {/if}
  </div>
</div>

<ArticleGrid
  articles={articleData.searchQuery ? articleData.items : articles.value}
  isLoading={articles.loading}
  skeletonCount={data.pageSize}
  onCardClick={(article) => panelMode.openPeek(article)}
/>

{#if !articleData.searchQuery && filteredCount.value > 0}
  <div class="mx-auto max-w-6xl px-4 pb-8">
    <Pagination
      currentPage={data.currentPage}
      totalPages={Math.ceil(filteredCount.value / data.pageSize)}
      onPageChange={handlePageChange}
    />
  </div>
{/if}
