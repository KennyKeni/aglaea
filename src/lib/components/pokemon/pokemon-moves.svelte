<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Move } from '$lib/types/pokemon';

	let { moves = [], loading = false }: { moves?: Move[]; loading?: boolean } = $props();
</script>

<Card.Root class="rounded-2xl">
	<Card.Header class="pb-3">
		<div>
			<Card.Title class="text-base">Moves</Card.Title>
			<div class="text-muted-foreground mt-1 text-sm">
				{#if loading}
					Loading moves...
				{:else}
					Showing {moves.length} moves for this form
				{/if}
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="space-y-2">
			{#if loading}
				{#each Array(6) as _, i (i)}
					<Skeleton class="h-14 w-full rounded-xl" />
				{/each}
			{:else if moves.length}
				{#each moves as mv, i (`move-${i}-${mv.move.id}`)}
					<div class="bg-background hover:bg-muted rounded-xl border p-3">
						<div class="flex items-start justify-between gap-3">
							<div>
								<div class="font-medium">{mv.move.name}</div>
								<div class="mt-1 flex flex-wrap items-center gap-2">
									<span class="text-muted-foreground text-xs">{mv.method.name}</span>
									{#if mv.level}
										<span class="text-muted-foreground text-xs">Lv. {mv.level}</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="text-muted-foreground text-sm">No moves data.</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
