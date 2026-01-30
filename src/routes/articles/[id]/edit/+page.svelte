<svelte:head>
  <title>Edit {data.article.title} | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import DetailHeader from '$lib/components/ui/detail-header.svelte';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
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

<DetailHeader title="Edit: {data.article.title}" closeHref="/articles/{data.article.id}" />

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
