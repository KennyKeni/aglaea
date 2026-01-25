<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import type { Article } from '$lib/types/article';

  export type ContentMode = 'peek' | 'full' | 'loading';

  let {
    article,
    fullArticle = null,
    mode = 'full',
  }: {
    article: Article;
    fullArticle?: Article | null;
    mode?: ContentMode;
  } = $props();

  const dataSource = $derived(fullArticle ?? article);
  const coverImage = $derived(dataSource.coverImage?.url);
  const fallbackImage = $derived(dataSource.images?.[0]?.url);
  const displayImage = $derived(coverImage ?? fallbackImage);
  const isFull = $derived(mode === 'full');

  const formattedDate = $derived(
    dataSource.createdAt
      ? new Date(dataSource.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null,
  );
</script>

{#if isFull}
  <article>
    {#if displayImage}
      <div class="mb-8 aspect-video overflow-hidden rounded-xl bg-muted">
        <img src={displayImage} alt={dataSource.title} class="h-full w-full object-cover" />
      </div>
    {/if}

    {#if dataSource.categories?.length}
      <div class="mb-4 flex flex-wrap gap-2">
        {#each dataSource.categories as category (category.id)}
          <Badge variant="secondary" class="rounded-full">
            {category.name}
          </Badge>
        {/each}
      </div>
    {/if}

    <h1 id="article-title" class="mb-4 text-5xl font-bold tracking-tight">{dataSource.title}</h1>

    {#if dataSource.subtitle}
      <p class="mb-6 text-xl text-muted-foreground">{dataSource.subtitle}</p>
    {/if}

    <div class="mb-8 flex items-center gap-3 border-b pb-8 text-sm text-muted-foreground">
      {#if dataSource.author}
        <span>By {dataSource.author.name}</span>
      {/if}
      {#if dataSource.author && formattedDate}
        <span>·</span>
      {/if}
      {#if formattedDate}
        <span>{formattedDate}</span>
      {/if}
    </div>

    {#if dataSource.renderError}
      <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p class="text-destructive">Failed to load article content.</p>
      </div>
    {:else if dataSource.contentHtml}
      <div class="prose prose-lg max-w-none prose-neutral dark:prose-invert">
        {@html dataSource.contentHtml}
      </div>
    {/if}
  </article>
{:else}
  <article>
    {#if displayImage}
      <div class="mb-6 aspect-video overflow-hidden rounded-xl bg-muted">
        <img src={displayImage} alt={dataSource.title} class="h-full w-full object-cover" />
      </div>
    {/if}

    {#if dataSource.categories?.length}
      <div class="mb-3 flex flex-wrap gap-2">
        {#each dataSource.categories as category (category.id)}
          <Badge variant="secondary" class="rounded-full">
            {category.name}
          </Badge>
        {/each}
      </div>
    {/if}

    <h2 class="mb-3 text-3xl font-bold tracking-tight">{dataSource.title}</h2>

    {#if dataSource.subtitle}
      <p class="mb-4 text-lg text-muted-foreground">{dataSource.subtitle}</p>
    {/if}

    <div class="mb-6 flex items-center gap-3 border-b pb-6 text-sm text-muted-foreground">
      {#if dataSource.author}
        <span>By {dataSource.author.name}</span>
      {/if}
      {#if dataSource.author && formattedDate}
        <span>·</span>
      {/if}
      {#if formattedDate}
        <span>{formattedDate}</span>
      {/if}
    </div>

    {#if dataSource.description}
      <p class="text-muted-foreground">{dataSource.description}</p>
    {/if}
  </article>
{/if}
