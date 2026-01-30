<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn } from '$lib/utils';
	import { TYPE_COLORS } from '$lib/utils/pokemon';
	import type { Move } from '$lib/types/move';

	let {
		move,
		loading = false,
		href,
	}: {
		move?: Move;
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
					<Skeleton class="h-5 w-14 rounded-full" />
					<Skeleton class="h-5 w-16 rounded-full" />
				</div>
			</div>
			<div class="mt-3 flex gap-4">
				<Skeleton class="h-4 w-16" />
				<Skeleton class="h-4 w-16" />
				<Skeleton class="h-4 w-12" />
			</div>
			<Skeleton class="mt-auto h-12 w-full" />
		</div>
	</div>
{:else if move}
	<a {href} class="group w-full text-left">
		<Card.Root
			class="aspect-square rounded-2xl transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
		>
			<Card.Content class="flex h-full flex-col px-4 pt-3 pb-4">
				<div class="space-y-2">
					<div class="truncate text-base font-semibold">{move.name}</div>
					<div class="flex flex-wrap gap-1.5">
						<span
							class={cn(
								'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
								TYPE_COLORS[move.type.slug] || 'bg-muted',
							)}
						>
							{move.type.name}
						</span>
						<span
							class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
						>
							{move.category.name}
						</span>
					</div>
				</div>

				<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
					{#if move.power}
						<span>Power: <strong class="text-foreground">{move.power}</strong></span>
					{/if}
					{#if move.accuracy}
						<span>Acc: <strong class="text-foreground">{move.accuracy}%</strong></span>
					{/if}
					<span>PP: <strong class="text-foreground">{move.pp}</strong></span>
				</div>

				<div class="mt-auto line-clamp-3 text-sm text-muted-foreground">
					{move.shortDesc || move.desc || ''}
				</div>
			</Card.Content>
		</Card.Root>
	</a>
{/if}
