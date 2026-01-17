<script lang="ts">
  import ArticleCard from './article-card.svelte';
  import type { Article } from '$lib/types/article';

  let {
    articles,
    isLoading = false,
    onCardClick,
  }: {
    articles: Article[];
    isLoading?: boolean;
    onCardClick: (article: Article) => void;
  } = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-6">
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#if isLoading}
      {#each Array(6) as _, i (i)}
        <ArticleCard loading />
      {/each}
    {:else}
      {#each articles as article (article.id)}
        <ArticleCard {article} onclick={() => onCardClick(article)} />
      {/each}
    {/if}
  </div>
</div>
