<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import type { Article } from '$lib/types/article';

  let {
    article,
    loading = false,
    href,
  }: {
    article?: Article;
    loading?: boolean;
    href?: string;
  } = $props();

  const coverImage = $derived(article?.coverImage?.url);
  const fallbackImage = $derived(article?.images?.[0]?.url);
  const displayImage = $derived(coverImage ?? fallbackImage);
</script>

{#if loading}
  <div class="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
    <Skeleton class="aspect-video w-full shrink-0" />
    <div class="flex-1 space-y-3 p-4">
      <div class="flex gap-2">
        <Skeleton class="h-5 w-16 rounded-full" />
        <Skeleton class="h-5 w-20 rounded-full" />
      </div>
      <Skeleton class="h-6 w-3/4" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-2/3" />
    </div>
  </div>
{:else if article}
  <a {href} class="group h-full w-full text-left">
    <Card.Root
      class="flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div class="aspect-video shrink-0 overflow-hidden bg-muted">
        {#if displayImage}
          <img
            src={displayImage}
            alt={article.title}
            class="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        {:else}
          <div class="flex h-full w-full items-center justify-center">
            <span class="text-sm text-muted-foreground">No image</span>
          </div>
        {/if}
      </div>
      <Card.Content class="flex flex-1 flex-col p-4">
        {#if article.categories?.length}
          <div class="mb-2 flex flex-wrap gap-1.5">
            {#each article.categories.slice(0, 3) as category (category.id)}
              <Badge variant="secondary" class="rounded-full text-xs">
                {category.name}
              </Badge>
            {/each}
          </div>
        {/if}
        <h3 class="mb-1 line-clamp-2 font-semibold">{article.title}</h3>
        {#if article.description}
          <p class="line-clamp-2 text-sm text-muted-foreground">{article.description}</p>
        {:else if article.subtitle}
          <p class="line-clamp-2 text-sm text-muted-foreground">{article.subtitle}</p>
        {/if}
        {#if article.author}
          <p class="mt-auto pt-2 text-xs text-muted-foreground">By {article.author}</p>
        {/if}
      </Card.Content>
    </Card.Root>
  </a>
{/if}
