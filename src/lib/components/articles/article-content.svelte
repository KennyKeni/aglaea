<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Maximize2 } from '@lucide/svelte';
	import type { Article } from '$lib/types/article';

	export type ContentMode = 'peek' | 'full' | 'loading';

	let {
		article,
		fullArticle = null,
		mode = 'full',
		onExpand
	}: {
		article: Article;
		fullArticle?: Article | null;
		mode?: ContentMode;
		onExpand?: () => void;
	} = $props();

	const dataSource = $derived(fullArticle ?? article);
	const coverImage = $derived(dataSource.images?.find((img) => img.isCover)?.url);
	const fallbackImage = $derived(dataSource.images?.[0]?.url);
	const displayImage = $derived(coverImage ?? fallbackImage);
	const isPeek = $derived(mode === 'peek');
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
	<Card.Root class="rounded-2xl overflow-hidden">
		{#if displayImage}
			<div class="aspect-video bg-muted overflow-hidden">
				<img
					src={displayImage}
					alt={dataSource.title}
					class="h-full w-full object-cover"
				/>
			</div>
		{/if}
		<Card.Content class="p-4 md:p-6">
			{#if dataSource.categories?.length}
				<div class="flex flex-wrap gap-2 mb-3">
					{#each dataSource.categories as category (category.id)}
						<Badge variant="secondary" class="rounded-full">
							{category.name}
						</Badge>
					{/each}
				</div>
			{/if}

			<h2 class="text-2xl font-bold mb-2">{dataSource.title}</h2>

			{#if dataSource.subtitle}
				<p class="text-muted-foreground mb-3">{dataSource.subtitle}</p>
			{/if}

			<div class="flex items-center gap-3 text-sm text-muted-foreground mb-4">
				{#if dataSource.author}
					<span>By {dataSource.author}</span>
				{/if}
				{#if formattedDate}
					<span>{formattedDate}</span>
				{/if}
			</div>

			{#if dataSource.description && isPeek}
				<p class="text-muted-foreground">{dataSource.description}</p>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if isPeek}
		<div class="mt-4">
			<Card.Root class="rounded-2xl">
				<Card.Header class="pb-3">
					<div class="flex items-start justify-between gap-3">
						<div>
							<Card.Title class="text-base">Full Article</Card.Title>
							<div class="text-muted-foreground mt-1 text-sm">Expand to read the full content</div>
						</div>
						{#if onExpand}
							<Button variant="outline" size="sm" onclick={onExpand} class="cursor-pointer">
								<Maximize2 class="mr-2 h-4 w-4" />
								Expand
							</Button>
						{/if}
					</div>
				</Card.Header>
			</Card.Root>
		</div>
	{/if}
{/if}
