<script lang="ts">
  import { ArticleContent, ArticleToc } from '$lib/components/articles';
  import DetailFooter from '$lib/components/ui/detail-footer.svelte';
  import { Button } from '$lib/components/ui/button';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import { Pencil, X } from '@lucide/svelte';
  import { can } from '$lib/state/permissions.svelte';
  import { Resource, Action } from '$lib/types/auth';
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

<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
  <div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
    <h1 class="min-w-0 truncate text-sm font-semibold">{article?.title ?? ''}</h1>
    <div class="flex items-center gap-2">
      {#if article && can(Resource.Article, Action.Update)}
        <Button
          variant="ghost"
          size="sm"
          href="/articles/{article.id}/edit"
          data-sveltekit-preload-data="off"
        >
          <Pencil class="mr-2 h-4 w-4" />
          Edit
        </Button>
      {/if}
      <Button variant="ghost" size="icon" href={articleStore.getReturnHref('/articles')} aria-label="Close">
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>
</header>

{#if !article}
  <div class="px-4 py-4 md:px-6 md:py-6">
    <LoadingSpinner class="py-20" />
  </div>
{:else}
  <div class="px-4 py-4 md:px-6 md:py-6">
    <div class="xl:grid xl:grid-cols-[1fr_auto] xl:gap-8">
      <div class="mx-auto max-w-4xl">
        <ArticleContent {article} mode="full" />
      </div>
      {#if hasToc}
        <aside class="hidden xl:block">
          <ArticleToc {toc} />
        </aside>
      {/if}
    </div>
  </div>
  <DetailFooter />
{/if}
