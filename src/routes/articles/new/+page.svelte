<svelte:head>
  <title>New Article | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import { X } from '@lucide/svelte';
  import { articleStore } from '$lib/state/article-store.svelte';
  import type { Article } from '$lib/types/article';

  function handleSave(article: Article) {
    goto(`/articles/${article.id}`);
  }

  function handleCancel() {
    goto(articleStore.getReturnHref('/articles'));
  }

  const editorPromise = import('$lib/components/articles/article-editor.svelte');
</script>

<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
  <div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
    <h1 class="min-w-0 truncate text-sm font-semibold">New Article</h1>
    <Button variant="ghost" size="icon" href={articleStore.getReturnHref('/articles')} aria-label="Close">
      <X class="h-4 w-4" />
    </Button>
  </div>
</header>

<div class="mx-auto max-w-3xl px-4 py-4 md:px-6 md:py-6">
  {#await editorPromise}
    <LoadingSpinner class="py-20" />
  {:then { default: ArticleEditor }}
    <ArticleEditor onSave={handleSave} onCancel={handleCancel} />
  {/await}
</div>
