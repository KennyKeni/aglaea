<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { ArticleGrid, ArticleFilters } from '$lib/components/articles';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Plus } from '@lucide/svelte';
  import { getArticleDataContext, getArticlePanelContext } from '$lib/context/articles';
  import { can } from '$lib/state/permissions.svelte';
  import { Resource, Action } from '$lib/types/auth';
  import type { Article } from '$lib/types/article';
  import type { FilterOption } from '$lib/utils/filters';

  interface PageData {
    articles: Article[] | Promise<Article[]>;
    currentPage: number;
    totalCount: number;
    pageSize: number;
    categories: FilterOption[];
  }

  let { data }: { data: PageData } = $props();

  const articleData = getArticleDataContext();
  const { mode: panelMode } = getArticlePanelContext();

  let resolvedArticles: Article[] = $state([]);
  let isLoading = $state(true);

  $effect(() => {
    const articles = data.articles;
    if (articles instanceof Promise) {
      isLoading = true;
      articles.then((resolved) => {
        resolvedArticles = resolved;
        if (!articleData.searchQuery) {
          articleData.setItems(resolved);
          articleData.setPage(data.currentPage);
        }
        isLoading = false;
      });
    } else {
      resolvedArticles = articles;
      if (!articleData.searchQuery) {
        articleData.setItems(articles);
        articleData.setPage(data.currentPage);
      }
      isLoading = false;
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
  articles={articleData.searchQuery ? articleData.items : resolvedArticles}
  {isLoading}
  skeletonCount={data.pageSize}
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
