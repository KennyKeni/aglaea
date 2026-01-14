<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Article } from '$lib/types/article';

	let {
		article,
		loading = false,
		onclick
	}: {
		article?: Article;
		loading?: boolean;
		onclick?: () => void;
	} = $props();

	const coverImage = $derived(article?.images?.find((img) => img.isCover)?.url);
	const fallbackImage = $derived(article?.images?.[0]?.url);
	const displayImage = $derived(coverImage ?? fallbackImage);
</script>

{#if loading}
	<div class="bg-card h-full flex flex-col rounded-2xl border overflow-hidden">
		<Skeleton class="aspect-video w-full shrink-0" />
		<div class="p-4 space-y-3 flex-1">
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
	<button {onclick} class="group text-left w-full h-full">
		<Card.Root
			class="hover:border-primary/30 h-full flex flex-col rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
		>
			<div class="aspect-video bg-muted overflow-hidden shrink-0">
				{#if displayImage}
					<img
						src={displayImage}
						alt={article.title}
						class="h-full w-full object-cover transition-transform group-hover:scale-105"
					/>
				{:else}
					<div class="h-full w-full flex items-center justify-center">
						<span class="text-muted-foreground text-sm">No image</span>
					</div>
				{/if}
			</div>
			<Card.Content class="p-4 flex flex-col flex-1">
				{#if article.categories?.length}
					<div class="flex flex-wrap gap-1.5 mb-2">
						{#each article.categories.slice(0, 3) as category (category.id)}
							<Badge variant="secondary" class="rounded-full text-xs">
								{category.name}
							</Badge>
						{/each}
					</div>
				{/if}
				<h3 class="font-semibold line-clamp-2 mb-1">{article.title}</h3>
				{#if article.description}
					<p class="text-muted-foreground text-sm line-clamp-2">{article.description}</p>
				{:else if article.subtitle}
					<p class="text-muted-foreground text-sm line-clamp-2">{article.subtitle}</p>
				{/if}
				{#if article.author}
					<p class="text-muted-foreground text-xs mt-auto pt-2">By {article.author}</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</button>
{/if}
