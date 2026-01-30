<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Ability } from '$lib/types/ability';

	let {
		ability,
		loading = false,
		href,
	}: {
		ability?: Ability;
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
					<Skeleton class="h-5 w-20 rounded-full" />
				</div>
			</div>
			<Skeleton class="mt-auto h-12 w-full" />
		</div>
	</div>
{:else if ability}
	<a {href} class="group w-full text-left">
		<Card.Root
			class="aspect-square rounded-2xl transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
		>
			<Card.Content class="flex h-full flex-col px-4 pt-3 pb-4">
				<div class="space-y-2">
					<div class="truncate text-base font-semibold">{ability.name}</div>
					{#if ability.flags.length > 0}
						<div class="flex flex-wrap gap-1.5">
							{#each ability.flags as flag (flag.id)}
								<span
									class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
								>
									{flag.name}
								</span>
							{/each}
						</div>
					{/if}
				</div>

				<div class="mt-auto line-clamp-3 text-sm text-muted-foreground">
					{ability.shortDesc || ability.desc || ''}
				</div>
			</Card.Content>
		</Card.Root>
	</a>
{/if}
