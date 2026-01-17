<script lang="ts">
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
  import type { Article } from '$lib/types/article';

  let { data }: { data: { article: Article } } = $props();

  function handleSave() {
    goto(`/articles/${data.article.id}`);
  }

  function handleCancel() {
    goto(`/articles/${data.article.id}`);
  }

  const editorPromise = import('$lib/components/articles/article-editor.svelte');
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
  {#await editorPromise}
    <LoadingSpinner class="py-20" />
  {:then { default: ArticleEditor }}
    <ArticleEditor
      initialTitle={data.article.title}
      initialSubtitle={data.article.subtitle ?? ''}
      initialDescription={data.article.description ?? ''}
      initialAuthor={data.article.author ?? ''}
      initialBody={data.article.body}
      editMeta={{
        id: String(data.article.id),
        createdAt: data.article.createdAt,
        categories: data.article.categories ?? [],
        images: data.article.images ?? [],
      }}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  {/await}
</div>
