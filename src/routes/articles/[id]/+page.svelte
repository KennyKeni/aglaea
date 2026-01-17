<script lang="ts">
  import { ArticleContent, ArticleToc } from '$lib/components/articles';
  import { Button } from '$lib/components/ui/button';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import { Pencil } from '@lucide/svelte';
  import { can } from '$lib/state/permissions.svelte';
  import { Resource, Action } from '$lib/types/auth';
  import type { Article } from '$lib/types/article';
  import type { TocItem } from '$lib/utils/toc';

  let { data }: { data: { article: Article; toc: TocItem[] } } = $props();

  let article: Article | null = $state(null);
  let toc: TocItem[] = $state([]);

  $effect(() => {
    article = data.article;
    toc = data.toc;
  });

  const hasToc = $derived(toc.length > 0);
</script>

<div class="mx-auto max-w-7xl px-4 py-8">
  {#if !article}
    <LoadingSpinner class="py-20" />
  {:else}
    <div
      class="mx-auto max-w-3xl xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[1fr_48rem_16rem] xl:gap-8"
    >
      <div class="hidden xl:block"></div>
      <div>
        {#if can(Resource.Article, Action.Update)}
          <div class="mb-6 flex justify-end">
            <Button variant="ghost" size="sm" href="/articles/{article.id}/edit">
              <Pencil class="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        {/if}
        <ArticleContent {article} mode="full" />
      </div>
      {#if hasToc}
        <aside class="hidden xl:block">
          <ArticleToc {toc} />
        </aside>
      {/if}
    </div>
  {/if}
</div>
