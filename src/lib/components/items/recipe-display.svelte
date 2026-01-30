<script lang="ts">
	import type { Recipe } from '$lib/types/item';
	import { ArrowRight } from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let {
		recipe,
		resultItem,
		resultCount
	}: {
		recipe: Recipe;
		resultItem: { id: number; name: string };
		resultCount: number;
	} = $props();

	const slug = $derived(recipe.type.slug);

	const isShaped = $derived(slug === 'crafting-shaped');
	const isShapeless = $derived(slug === 'crafting-shapeless');
	const isFurnace = $derived(
		['smelting', 'blasting', 'smoking', 'campfire-cooking'].includes(slug)
	);
	const isStonecutting = $derived(slug === 'stonecutting');
	const isSmithing = $derived(slug === 'smithing-transform' || slug === 'smithing-trim');

	// Build a slot map for shaped crafting (slot 0–8 → 3x3 grid)
	const slotMap = $derived.by(() => {
		const map = new SvelteMap<number, { type: 'item' | 'tag'; name: string; id?: number }>();
		for (const input of recipe.inputs) {
			if (input.slot != null) {
				map.set(input.slot, { type: 'item', name: input.item.name, id: input.item.id });
			}
		}
		for (const tagInput of recipe.tagInputs) {
			if (tagInput.slot != null) {
				map.set(tagInput.slot, { type: 'tag', name: tagInput.tag.name });
			}
		}
		return map;
	});

	// For smithing recipes, get slots by slotType slug
	function getSmithingSlot(slotTypeSlug: string): { type: 'item' | 'tag'; name: string; id?: number } | null {
		for (const input of recipe.inputs) {
			if (input.slotType?.slug === slotTypeSlug) {
				return { type: 'item', name: input.item.name, id: input.item.id };
			}
		}
		for (const tagInput of recipe.tagInputs) {
			if (tagInput.slotType?.slug === slotTypeSlug) {
				return { type: 'tag', name: tagInput.tag.name };
			}
		}
		return null;
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-3">
		<span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
			{recipe.type.name}
		</span>
		{#if recipe.experience}
			<span class="text-sm text-muted-foreground">XP: {recipe.experience}</span>
		{/if}
		{#if recipe.cookingTime}
			<span class="text-sm text-muted-foreground">Time: {recipe.cookingTime}s</span>
		{/if}
	</div>

	<div class="flex items-center gap-4">
		<!-- Input section -->
		{#if isShaped}
			<div class="grid grid-cols-3 gap-1.5">
				{#each Array(9) as _, i (i)}
					{@const cell = slotMap.get(i)}
					{#if cell}
						{#if cell.type === 'item' && cell.id}
							<a
								href="/items/{cell.id}"
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
								title={cell.name}
							>
								<span class="line-clamp-2">{cell.name}</span>
							</a>
						{:else}
							<div
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
								title={cell.name}
							>
								<span class="line-clamp-2">{cell.name}</span>
							</div>
						{/if}
					{:else}
						<div class="h-20 w-20 rounded border border-dashed bg-muted/30"></div>
					{/if}
				{/each}
			</div>
		{:else if isShapeless}
			<div class="flex flex-wrap gap-1.5">
				{#each recipe.inputs as input (input.item.id)}
					<a
						href="/items/{input.item.id}"
						class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
						title={input.item.name}
					>
						<span class="line-clamp-2">{input.item.name}</span>
					</a>
				{/each}
				{#each recipe.tagInputs as tagInput (tagInput.tag.id)}
					<div
						class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
						title={tagInput.tag.name}
					>
						<span class="line-clamp-2">{tagInput.tag.name}</span>
					</div>
				{/each}
			</div>
		{:else if isFurnace}
			<div class="flex flex-col gap-1.5">
				<!-- Input slot -->
				{#if recipe.inputs[0]}
					<a
						href="/items/{recipe.inputs[0].item.id}"
						class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
						title={recipe.inputs[0].item.name}
					>
						<span class="line-clamp-2">{recipe.inputs[0].item.name}</span>
					</a>
				{:else if recipe.tagInputs[0]}
					<div
						class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
						title={recipe.tagInputs[0].tag.name}
					>
						<span class="line-clamp-2">{recipe.tagInputs[0].tag.name}</span>
					</div>
				{/if}
				<!-- Fuel slot -->
				<div
					class="flex h-20 w-20 items-center justify-center rounded border border-dashed bg-muted/30 text-center text-sm text-muted-foreground"
				>
					Fuel
				</div>
			</div>
		{:else if isStonecutting}
			{#if recipe.inputs[0]}
				<a
					href="/items/{recipe.inputs[0].item.id}"
					class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
					title={recipe.inputs[0].item.name}
				>
					<span class="line-clamp-2">{recipe.inputs[0].item.name}</span>
				</a>
			{:else if recipe.tagInputs[0]}
				<div
					class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
					title={recipe.tagInputs[0].tag.name}
				>
					<span class="line-clamp-2">{recipe.tagInputs[0].tag.name}</span>
				</div>
			{/if}
		{:else if isSmithing}
			{@const template = getSmithingSlot('template')}
			{@const base = getSmithingSlot('base')}
			{@const addition = getSmithingSlot('addition')}
			<div class="flex gap-1.5">
				<div class="flex flex-col items-center gap-0.5">
					<span class="text-[9px] text-muted-foreground">Template</span>
					{#if template}
						{#if template.type === 'item' && template.id}
							<a
								href="/items/{template.id}"
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
								title={template.name}
							>
								<span class="line-clamp-2">{template.name}</span>
							</a>
						{:else}
							<div
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
								title={template.name}
							>
								<span class="line-clamp-2">{template.name}</span>
							</div>
						{/if}
					{:else}
						<div class="h-20 w-20 rounded border border-dashed bg-muted/30"></div>
					{/if}
				</div>
				<div class="flex flex-col items-center gap-0.5">
					<span class="text-[9px] text-muted-foreground">Base</span>
					{#if base}
						{#if base.type === 'item' && base.id}
							<a
								href="/items/{base.id}"
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
								title={base.name}
							>
								<span class="line-clamp-2">{base.name}</span>
							</a>
						{:else}
							<div
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
								title={base.name}
							>
								<span class="line-clamp-2">{base.name}</span>
							</div>
						{/if}
					{:else}
						<div class="h-20 w-20 rounded border border-dashed bg-muted/30"></div>
					{/if}
				</div>
				<div class="flex flex-col items-center gap-0.5">
					<span class="text-[9px] text-muted-foreground">Addition</span>
					{#if addition}
						{#if addition.type === 'item' && addition.id}
							<a
								href="/items/{addition.id}"
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
								title={addition.name}
							>
								<span class="line-clamp-2">{addition.name}</span>
							</a>
						{:else}
							<div
								class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
								title={addition.name}
							>
								<span class="line-clamp-2">{addition.name}</span>
							</div>
						{/if}
					{:else}
						<div class="h-20 w-20 rounded border border-dashed bg-muted/30"></div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Fallback: list all inputs -->
			<div class="flex flex-wrap gap-1.5">
				{#each recipe.inputs as input (input.item.id)}
					<a
						href="/items/{input.item.id}"
						class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight hover:border-primary hover:bg-muted/80"
						title={input.item.name}
					>
						<span class="line-clamp-2">{input.item.name}</span>
					</a>
				{/each}
				{#each recipe.tagInputs as tagInput (tagInput.tag.id)}
					<div
						class="flex h-20 w-20 items-center justify-center rounded border bg-muted p-1 text-center text-sm leading-tight"
						title={tagInput.tag.name}
					>
						<span class="line-clamp-2">{tagInput.tag.name}</span>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Arrow -->
		<ArrowRight class="h-6 w-6 shrink-0 text-muted-foreground" />

		<!-- Result -->
		<div
			class="flex h-24 w-24 items-center justify-center rounded border-2 border-primary/50 bg-muted p-1 text-center text-sm font-medium leading-tight"
			title="{resultItem.name} x{resultCount}"
		>
			<div>
				<span class="line-clamp-2">{resultItem.name}</span>
				{#if resultCount > 1}
					<span class="text-muted-foreground">x{resultCount}</span>
				{/if}
			</div>
		</div>
	</div>
</div>
