<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Article } from '$lib/types/article';

	export type ContentMode = 'peek' | 'full' | 'loading';

	let {
		article,
		fullArticle = null,
		mode = 'full'
	}: {
		article: Article;
		fullArticle?: Article | null;
		mode?: ContentMode;
	} = $props();

	const dataSource = $derived(fullArticle ?? article);
	const coverImage = $derived(dataSource.images?.find((img) => img.isCover)?.url);
	const fallbackImage = $derived(dataSource.images?.[0]?.url);
	const displayImage = $derived(coverImage ?? fallbackImage);
	const isFull = $derived(mode === 'full');

	const formattedDate = $derived(
		dataSource.createdAt
			? new Date(dataSource.createdAt).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: null
	);
</script>

{#if isFull}
	<article>
		{#if displayImage}
			<div class="aspect-video bg-muted overflow-hidden rounded-xl mb-8">
				<img
					src={displayImage}
					alt={dataSource.title}
					class="h-full w-full object-cover"
				/>
			</div>
		{/if}

		{#if dataSource.categories?.length}
			<div class="flex flex-wrap gap-2 mb-4">
				{#each dataSource.categories as category (category.id)}
					<Badge variant="secondary" class="rounded-full">
						{category.name}
					</Badge>
				{/each}
			</div>
		{/if}

		<h1 id="article-title" class="text-5xl font-bold tracking-tight mb-4">{dataSource.title}</h1>

		{#if dataSource.subtitle}
			<p class="text-xl text-muted-foreground mb-6">{dataSource.subtitle}</p>
		{/if}

		<div class="flex items-center gap-3 text-sm text-muted-foreground mb-8 pb-8 border-b">
			{#if dataSource.author}
				<span>By {dataSource.author}</span>
			{/if}
			{#if dataSource.author && formattedDate}
				<span>·</span>
			{/if}
			{#if formattedDate}
				<span>{formattedDate}</span>
			{/if}
		</div>

		{#if dataSource.bodyHtml}
			<div class="prose prose-neutral dark:prose-invert prose-lg max-w-none">
				{@html dataSource.bodyHtml}
			</div>
		{/if}
	</article>
{:else}
	<article>
		{#if displayImage}
			<div class="aspect-video bg-muted overflow-hidden rounded-xl mb-6">
				<img
					src={displayImage}
					alt={dataSource.title}
					class="h-full w-full object-cover"
				/>
			</div>
		{/if}

		{#if dataSource.categories?.length}
			<div class="flex flex-wrap gap-2 mb-3">
				{#each dataSource.categories as category (category.id)}
					<Badge variant="secondary" class="rounded-full">
						{category.name}
					</Badge>
				{/each}
			</div>
		{/if}

		<h2 class="text-3xl font-bold tracking-tight mb-3">{dataSource.title}</h2>

		{#if dataSource.subtitle}
			<p class="text-lg text-muted-foreground mb-4">{dataSource.subtitle}</p>
		{/if}

		<div class="flex items-center gap-3 text-sm text-muted-foreground mb-6 pb-6 border-b">
			{#if dataSource.author}
				<span>By {dataSource.author}</span>
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
