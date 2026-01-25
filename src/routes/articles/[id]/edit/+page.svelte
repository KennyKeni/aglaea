<svelte:head>
  <title>Edit {data.article.title} | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import { X } from '@lucide/svelte';
  import type { Article } from '$lib/types/article';

  let { data }: { data: { article: Article } } = $props();

  function handleSave() {
    goto(`/articles/${data.article.id}`, { invalidateAll: true });
  }

  function handleCancel() {
    goto(`/articles/${data.article.id}`);
  }

  const editorPromise = import('$lib/components/articles/article-editor.svelte');
</script>

<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
  <div class="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
    <h1 class="min-w-0 truncate text-sm font-semibold">Edit: {data.article.title}</h1>
    <Button variant="ghost" size="icon" href="/articles/{data.article.id}" aria-label="Close">
      <X class="h-4 w-4" />
    </Button>
  </div>
</header>

<div class="mx-auto max-w-3xl px-4 py-4 md:px-6 md:py-6">
  {#await editorPromise}
    <LoadingSpinner class="py-20" />
  {:then { default: ArticleEditor }}
    <ArticleEditor
      initialTitle={data.article.title}
      initialSubtitle={data.article.subtitle ?? ''}
      initialDescription={data.article.description ?? ''}
      initialContent={data.article.content}
      editMeta={{
        id: String(data.article.id),
        createdAt: data.article.createdAt,
        ownerId: data.article.ownerId,
        author: data.article.author,
        categories: data.article.categories ?? [],
        coverImage: data.article.coverImage ?? null,
        images: data.article.images ?? [],
      }}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  {/await}
</div>
