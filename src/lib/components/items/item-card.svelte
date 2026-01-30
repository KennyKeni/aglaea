<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Item } from '$lib/types/item';

	let {
		item,
		loading = false,
		href,
	}: {
		item?: Item;
		loading?: boolean;
		href?: string;
	} = $props();
</script>

{#if loading}
	<div class="aspect-square rounded-2xl border bg-card p-4">
		<div class="flex h-full flex-col">
			<div class="space-y-2">
				<Skeleton class="h-5 w-24" />
				<div class="flex gap-1.5">
					<Skeleton class="h-5 w-16 rounded-full" />
				</div>
			</div>
			<Skeleton class="mt-auto h-12 w-full" />
		</div>
	</div>
{:else if item}
	<a {href} class="group w-full text-left">
		<Card.Root
			class="aspect-square rounded-2xl transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
		>
			<Card.Content class="flex h-full flex-col px-4 pt-3 pb-4">
				<div class="space-y-2">
					<div class="truncate text-base font-semibold">{item.name}</div>
					<div class="flex flex-wrap gap-1.5">
						{#if item.namespace}
							<span
								class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
							>
								{item.namespace.name}
							</span>
						{/if}
						{#each item.tags as tag (tag.id)}
							<span
								class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
							>
								{tag.name}
							</span>
						{/each}
					</div>
				</div>

				<div class="mt-auto line-clamp-3 text-sm text-muted-foreground">
					{item.shortDesc || item.desc || ''}
				</div>
			</Card.Content>
		</Card.Root>
	</a>
{/if}
