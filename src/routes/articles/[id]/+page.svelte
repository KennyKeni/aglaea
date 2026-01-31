<script lang="ts">
  import { ArticleContent } from '$lib/components/articles';
  import DetailFooter from '$lib/components/ui/detail-footer.svelte';
  import Toc from '$lib/components/ui/toc.svelte';
  import DetailHeader from '$lib/components/ui/detail-header.svelte';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import EditButton from '$lib/components/ui/edit-button.svelte';
  import { Resource } from '$lib/types/auth';
  import { articleStore } from '$lib/state/article-store.svelte';
  import type { Article } from '$lib/types/article';
  import type { TocItem } from '$lib/utils/toc';

  let { data }: { data: { article: Article; toc: TocItem[] } } = $props();

  const article = $derived(data.article);
  const toc = $derived(data.toc);
  const hasToc = $derived(toc.length > 0);

  const metaDescription = $derived.by(() => {
    if (!article) return '';
    if (article.description) return article.description;
    if (article.subtitle) return article.subtitle;
    const authorText = article.author ? ` by ${article.author.name}` : '';
    return `${article.title}${authorText}`;
  });
</script>

<svelte:head>
  {#if article}
    <title>{article.title}</title>
    <meta name="description" content={metaDescription} />
  {/if}
</svelte:head>

<div class="flex min-h-svh flex-col">
  <DetailHeader
    title={article?.title ?? ''}
    closeHref={articleStore.getReturnHref('/articles')}
  >
    {#snippet actions()}
      {#if article}
        <EditButton resource={Resource.Article} href="/articles/{article.id}/edit" />
      {/if}
    {/snippet}
  </DetailHeader>
  {#if !article}
    <div class="flex-1 px-4 py-4 md:px-6 md:py-6">
      <LoadingSpinner class="py-20" />
    </div>
  {:else}
    <div class="flex-1 px-4 py-4 md:px-6 md:py-6">
      <div class="xl:grid xl:grid-cols-[1fr_auto] xl:gap-8">
        <div class="mx-auto max-w-4xl">
          <ArticleContent {article} mode="full" />
        </div>
        {#if hasToc}
          <aside class="hidden xl:block">
            <Toc {toc} />
          </aside>
        {/if}
      </div>
    </div>
    <DetailFooter />
  {/if}
</div>
