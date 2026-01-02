<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Form } from '$lib/types/pokemon';

	let { form, loading = false }: { form?: Form | null; loading?: boolean } = $props();
</script>

<Card.Root class="rounded-2xl">
	<Card.Header class="pb-3">
		<Card.Title class="text-base">Details</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if loading || !form}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each Array(4) as _, i (i)}
					<Skeleton class="h-20 w-full rounded-xl" />
				{/each}
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="bg-muted rounded-xl p-4">
					<div class="text-muted-foreground text-xs font-medium">Catch Rate</div>
					<div class="mt-1 text-lg font-semibold">{form.catchRate}</div>
				</div>
				<div class="bg-muted rounded-xl p-4">
					<div class="text-muted-foreground text-xs font-medium">Base Friendship</div>
					<div class="mt-1 text-lg font-semibold">{form.baseFriendship}</div>
				</div>
				<div class="bg-muted rounded-xl p-4">
					<div class="text-muted-foreground text-xs font-medium">Egg Cycles</div>
					<div class="mt-1 text-lg font-semibold">{form.eggCycles}</div>
				</div>
				<div class="bg-muted rounded-xl p-4">
					<div class="text-muted-foreground text-xs font-medium">Gender Ratio</div>
					<div class="mt-1 text-lg font-semibold">
						{#if form.maleRatio === null}
							Genderless
						{:else}
							{(form.maleRatio * 100).toFixed(0)}% M
						{/if}
					</div>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="bg-muted rounded-xl p-4">
					<div class="text-muted-foreground text-xs font-medium">Height</div>
					<div class="mt-1 text-lg font-semibold">{(form.height / 10).toFixed(1)}m</div>
				</div>
				<div class="bg-muted rounded-xl p-4">
					<div class="text-muted-foreground text-xs font-medium">Weight</div>
					<div class="mt-1 text-lg font-semibold">{(form.weight / 10).toFixed(1)}kg</div>
				</div>
			</div>

			{#if form.abilities?.length}
				<div>
					<div class="text-muted-foreground mb-2 text-xs font-medium">Abilities</div>
					<div class="flex flex-wrap gap-2">
						{#each form.abilities as ab, i (`ability-${i}-${ab.ability.id}`)}
							<Badge variant="outline" class="rounded-full">
								{ab.ability.name}
								<span class="text-muted-foreground ml-1">({ab.slot.name})</span>
							</Badge>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
