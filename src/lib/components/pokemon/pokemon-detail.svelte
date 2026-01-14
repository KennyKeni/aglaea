<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { cn } from '$lib/utils';
	import { TYPE_COLORS, formatId, getArtworkUrl, getStatTotal, clamp } from '$lib/utils/pokemon';
	import type { Pokemon, Form } from '$lib/types/pokemon';

	let {
		pokemon,
		form,
		loading = false
	}: { pokemon: Pokemon; form: Form; loading?: boolean } = $props();

	const stats = $derived([
		{ label: 'HP', value: form.baseHp },
		{ label: 'Atk', value: form.baseAttack },
		{ label: 'Def', value: form.baseDefence },
		{ label: 'SpA', value: form.baseSpecialAttack },
		{ label: 'SpD', value: form.baseSpecialDefence },
		{ label: 'Spe', value: form.baseSpeed }
	]);
</script>

<Card.Root class="rounded-2xl">
	<Card.Content class="p-4 md:p-6">
		<div class="grid gap-4 md:grid-cols-12">
			<div class="self-stretch md:col-span-4">
				<div class="bg-muted flex h-full flex-col rounded-2xl p-4 md:p-5">
					<div class="flex h-52 w-full flex-1 items-center justify-center md:h-auto">
						<img
							src={getArtworkUrl(pokemon.id)}
							alt={form.name}
							class="h-full w-full object-contain"
						/>
					</div>
					<div class="mt-3 text-center">
						<div class="text-base font-semibold">{form.name}</div>
					</div>
				</div>
			</div>

			<div class="space-y-3 md:col-span-8">
				<div class="flex items-start justify-between gap-3">
					<div>
						<div class="text-muted-foreground text-xs font-medium">
							{formatId(pokemon.id)}
						</div>
						<div class="text-3xl font-semibold">{pokemon.name}</div>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each form.types as { type } (type.id)}
							<span
								class={cn(
									'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
									TYPE_COLORS[type.slug] || 'bg-muted'
								)}
							>
								{type.name}
							</span>
						{/each}
					</div>
				</div>

				{#if form.abilities?.length}
					<div class="flex flex-wrap gap-2">
						{#each form.abilities as ab (`${ab.ability.id}-${ab.slot.id}`)}
							<Badge variant="outline" class="rounded-full px-3 py-1">
								{ab.ability.name}
								{#if ab.slot.slug === 'hidden'}
									<span class="text-muted-foreground ml-1 text-xs">(Hidden)</span>
								{/if}
							</Badge>
						{/each}
					</div>
				{/if}

				<div class="bg-background rounded-2xl border p-4">
					<div class="mb-2 flex items-center justify-between">
						<div class="text-muted-foreground text-xs font-medium">Base stats</div>
						<div class="text-muted-foreground text-xs tabular-nums">
							Total {getStatTotal(form)}
						</div>
					</div>
					<div class="space-y-2">
						{#each stats as stat (stat.label)}
							<div class="grid grid-cols-12 items-center gap-3">
								<div class="text-muted-foreground col-span-2 text-xs">{stat.label}</div>
								<div class="col-span-8">
									<Progress value={(clamp(stat.value, 0, 255) / 255) * 100} class="h-2" />
								</div>
								<div class="text-foreground col-span-2 text-right text-xs tabular-nums">
									{stat.value}
								</div>
							</div>
						{/each}
					</div>
				</div>

				{#if pokemon.description}
					<div class="text-muted-foreground bg-background rounded-2xl border p-4 text-sm">
						{pokemon.description}
					</div>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>
