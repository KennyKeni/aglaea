<svelte:head>
  <title>Articles | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { ArticleGrid, ArticleFilters } from '$lib/components/articles';
  import Pagination from '$lib/components/ui/pagination.svelte';
  import CreateButton from '$lib/components/ui/create-button.svelte';
  import { articleStore } from '$lib/state/article-store.svelte';
  import { Resource } from '$lib/types/auth';
  import type { Article } from '$lib/types/article';
  import type { FilterOption } from '$lib/utils/filters';
  import type { Streamable } from '$lib/utils/streaming';

  interface PageData {
    articles: Streamable<Article[]>;
    filteredCount: Streamable<number>;
    currentPage: number;
    pageSize: number;
    categories: Streamable<FilterOption[]>;
  }

  let { data }: { data: PageData } = $props();

  let articles: Article[] = $state([]);
  let filteredCount: number = $state(0);
  let categories: FilterOption[] = $state([]);
  let isLoading = $state(true);

  const hasCachedItems = $derived(
    articleStore.items.length > 0 && articleStore.currentPage === data.currentPage,
  );

  $effect(() => {
    articleStore.setListParams(page.url.searchParams);
  });

  $effect(() => {
    const a = data.articles;
    if (a instanceof Promise) {
      if (!hasCachedItems) {
        isLoading = true;
      }
      a.then((resolved) => {
        articles = resolved;
        isLoading = false;
      });
    } else {
      articles = a;
      isLoading = false;
    }
  });

  $effect(() => {
    const fc = data.filteredCount;
    if (fc instanceof Promise) {
      fc.then((resolved) => {
        filteredCount = resolved;
      });
    } else {
      filteredCount = fc;
    }
  });

  $effect(() => {
    const c = data.categories;
    if (c instanceof Promise) {
      c.then((resolved) => {
        categories = resolved;
      });
    } else {
      categories = c;
    }
  });

  $effect(() => {
    if (!isLoading) {
      articleStore.setItems(articles);
      articleStore.setPage(data.currentPage);
    }
  });

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(page.url.searchParams);
    params.set('page', String(newPage));
    goto(`/articles?${params.toString()}`, { keepFocus: true });
  }

  const displayArticles = $derived.by(() => {
    if (hasCachedItems && isLoading) return articleStore.items;
    return articles;
  });
</script>

<div class="mx-auto max-w-6xl px-4 pt-4">
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <ArticleFilters {categories} />
    </div>
    <CreateButton resource={Resource.Article} href="/articles/new" label="New Article" />
  </div>
</div>

<ArticleGrid
  articles={displayArticles}
  isLoading={isLoading && !hasCachedItems}
  skeletonCount={data.pageSize}
/>

{#if !page.url.searchParams.has('search') && filteredCount > 0}
  <div class="mx-auto max-w-6xl px-4 pb-8">
    <Pagination
      currentPage={data.currentPage}
      totalPages={Math.ceil(filteredCount / data.pageSize)}
      onPageChange={handlePageChange}
    />
  </div>
{/if}
