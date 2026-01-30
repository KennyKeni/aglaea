<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import RecipeDisplay from './recipe-display.svelte';
	import type { Item } from '$lib/types/item';

	let { item }: { item: Item } = $props();
</script>

<div class="space-y-8">
	<!-- Overview -->
	<section id="overview">
		<h2 class="mb-4 text-lg font-semibold">Overview</h2>
		<Card.Root>
			<Card.Content class="p-4">
				<div class="space-y-4">
					<div class="flex flex-wrap gap-2">
						{#if item.namespace}
							<span
								class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
							>
								{item.namespace.name}
							</span>
						{/if}
						{#if item.generation}
							<span
								class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium"
							>
								Gen {item.generation}
							</span>
						{/if}
						<span
							class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {item.implemented
								? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
								: 'bg-muted text-muted-foreground'}"
						>
							{item.implemented ? 'Implemented' : 'Not Implemented'}
						</span>
					</div>

					{#if item.desc}
						<p class="text-sm text-muted-foreground">{item.desc}</p>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Recipes -->
	{#if item.recipes.length > 0}
		<section id="recipes">
			<h2 class="mb-4 text-lg font-semibold">Recipes</h2>
			{#each item.recipes as recipe (recipe.id)}
				<Card.Root class="mb-4">
					<Card.Content class="p-4">
						<RecipeDisplay
							{recipe}
							resultItem={{ id: item.id, name: item.name }}
							resultCount={recipe.resultCount}
						/>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>
	{/if}

	<!-- Tags -->
	{#if item.tags.length > 0}
		<section id="tags">
			<h2 class="mb-4 text-lg font-semibold">Tags</h2>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="flex flex-wrap gap-2">
						{#each item.tags as tag (tag.id)}
							<span
								class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium"
							>
								{tag.name}
							</span>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	<!-- Boosts -->
	{#if item.boosts.length > 0}
		<section id="boosts">
			<h2 class="mb-4 text-lg font-semibold">Stat Boosts</h2>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="space-y-2">
						{#each item.boosts as boost (boost.stat.id)}
							<div class="flex items-center gap-2">
								<span class="font-medium">{boost.stat.name}</span>
								<span
									class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
								>
									+{boost.stages}
								</span>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	<!-- Flags -->
	{#if item.flags.length > 0}
		<section id="flags">
			<h2 class="mb-4 text-lg font-semibold">Flags</h2>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="flex flex-wrap gap-2">
						{#each item.flags as flag (flag.id)}
							<span
								class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium"
							>
								{flag.name}
							</span>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}
</div>
