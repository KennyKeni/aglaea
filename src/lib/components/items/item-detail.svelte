<script lang="ts">
	import * as Card from '$lib/components/ui/card';
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
						{#each item.boosts as boost}
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

	<!-- Recipes -->
	{#if item.recipes.length > 0}
		<section id="recipes">
			<h2 class="mb-4 text-lg font-semibold">Recipes</h2>
			{#each item.recipes as recipe (recipe.id)}
				<Card.Root class="mb-4">
					<Card.Content class="p-4">
						<div class="space-y-3">
							<div class="flex flex-wrap items-center gap-3">
								<span
									class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium"
								>
									{recipe.type.name}
								</span>
								<span class="text-sm text-muted-foreground">
									Yields: {recipe.resultCount}
								</span>
								{#if recipe.experience}
									<span class="text-sm text-muted-foreground">
										XP: {recipe.experience}
									</span>
								{/if}
								{#if recipe.cookingTime}
									<span class="text-sm text-muted-foreground">
										Time: {recipe.cookingTime}s
									</span>
								{/if}
							</div>

							{#if recipe.inputs.length > 0}
								<div>
									<div class="text-xs font-medium text-muted-foreground">Inputs</div>
									<div class="mt-1 flex flex-wrap gap-2">
										{#each recipe.inputs as input}
											<span
												class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
											>
												{input.item.name}
												{#if input.slotType}
													<span class="ml-1 text-muted-foreground">({input.slotType.name})</span>
												{/if}
											</span>
										{/each}
									</div>
								</div>
							{/if}

							{#if recipe.tagInputs.length > 0}
								<div>
									<div class="text-xs font-medium text-muted-foreground">Tag Inputs</div>
									<div class="mt-1 flex flex-wrap gap-2">
										{#each recipe.tagInputs as tagInput}
											<span
												class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
											>
												{tagInput.tag.name}
												{#if tagInput.slotType}
													<span class="ml-1 text-muted-foreground"
														>({tagInput.slotType.name})</span
													>
												{/if}
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>
	{/if}
</div>
