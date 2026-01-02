<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Tabs from '$lib/components/ui/tabs';
	import { ListChecks } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { TYPE_COLORS, formatId, getArtworkUrl, getStatTotal, clamp, type Pokemon } from '../types';

	interface PageData {
		pokemon: Pokemon;
	}

	let { data }: { data: PageData } = $props();

	let formIndex = $state(0);
	let activeForm = $derived(data.pokemon.forms[formIndex] ?? null);
</script>

<svelte:head>
	<title>{data.pokemon.name} | Pokedex</title>
	<meta name="description" content={data.pokemon.description || `Details about ${data.pokemon.name}`} />
</svelte:head>

{#if activeForm}
	{#if data.pokemon.forms.length > 1}
		<div class="mb-4 flex flex-wrap items-center gap-2">
			<span class="text-muted-foreground text-xs">Form:</span>
			{#each data.pokemon.forms as form, idx (`${data.pokemon.id}-form-${idx}`)}
				<button
					onclick={() => (formIndex = idx)}
					class={cn(
						'whitespace-nowrap rounded-full border px-3 py-1 text-xs',
						formIndex === idx
							? 'bg-primary text-primary-foreground border-primary'
							: 'bg-background hover:bg-muted'
					)}
				>
					{form.name}
				</button>
			{/each}
		</div>
	{/if}

	<Card.Root class="rounded-2xl">
		<Card.Content class="p-4 md:p-6">
			<div class="grid gap-4 md:grid-cols-12">
				<div class="self-stretch md:col-span-4">
					<div class="bg-muted flex h-full flex-col rounded-2xl p-4 md:p-5">
						<div class="flex h-52 w-full flex-1 items-center justify-center md:h-auto">
							<img
								src={getArtworkUrl(data.pokemon.id)}
								alt={activeForm.name}
								class="h-full w-full object-contain"
							/>
						</div>
						<div class="mt-3 text-center">
							<div class="text-base font-semibold">
								{activeForm.name}
							</div>
						</div>
					</div>
				</div>

				<div class="space-y-3 md:col-span-8">
					<div class="flex items-start justify-between gap-3">
						<div>
							<div class="text-muted-foreground text-xs font-medium">
								{formatId(data.pokemon.id)}
							</div>
							<div class="text-3xl font-semibold">
								{data.pokemon.name}
							</div>
						</div>

						<div class="flex flex-wrap gap-2">
							{#each activeForm.types as { type } (type.id)}
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

					<div class="bg-background rounded-2xl border p-4">
						<div class="mb-2 flex items-center justify-between">
							<div class="text-muted-foreground text-xs font-medium">Base stats</div>
							<div class="text-muted-foreground text-xs tabular-nums">
								Total {getStatTotal(activeForm)}
							</div>
						</div>
						<div class="space-y-2">
							{#each [
								{ label: 'HP', value: activeForm.baseHp },
								{ label: 'Atk', value: activeForm.baseAttack },
								{ label: 'Def', value: activeForm.baseDefence },
								{ label: 'SpA', value: activeForm.baseSpecialAttack },
								{ label: 'SpD', value: activeForm.baseSpecialDefence },
								{ label: 'Spe', value: activeForm.baseSpeed }
							] as stat (stat.label)}
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

					{#if data.pokemon.description}
						<div class="text-muted-foreground bg-background rounded-2xl border p-4 text-sm">
							{data.pokemon.description}
						</div>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="h-4"></div>

	<div class="space-y-4">
		<Tabs.Root value="moves" class="w-full">
			<Tabs.List class="grid w-full grid-cols-2 rounded-2xl">
				<Tabs.Trigger value="moves">Moves</Tabs.Trigger>
				<Tabs.Trigger value="details">Details</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="moves" class="mt-4">
				<Card.Root class="rounded-2xl">
					<Card.Header class="pb-3">
						<div>
							<Card.Title class="text-base">Moves</Card.Title>
							<div class="text-muted-foreground mt-1 text-sm">
								Showing {activeForm.moves?.length ?? 0} moves for this form
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="space-y-2">
							{#if activeForm.moves?.length}
								{#each activeForm.moves as mv, i (`move-${i}-${mv.move.id}`)}
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
			</Tabs.Content>

			<Tabs.Content value="details" class="mt-4">
				<Card.Root class="rounded-2xl">
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Details</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="bg-muted rounded-xl p-4">
								<div class="text-muted-foreground text-xs font-medium">Catch Rate</div>
								<div class="mt-1 text-lg font-semibold">{activeForm.catchRate}</div>
							</div>
							<div class="bg-muted rounded-xl p-4">
								<div class="text-muted-foreground text-xs font-medium">Base Friendship</div>
								<div class="mt-1 text-lg font-semibold">{activeForm.baseFriendship}</div>
							</div>
							<div class="bg-muted rounded-xl p-4">
								<div class="text-muted-foreground text-xs font-medium">Egg Cycles</div>
								<div class="mt-1 text-lg font-semibold">{activeForm.eggCycles}</div>
							</div>
							<div class="bg-muted rounded-xl p-4">
								<div class="text-muted-foreground text-xs font-medium">Gender Ratio</div>
								<div class="mt-1 text-lg font-semibold">
									{#if activeForm.maleRatio === null}
										Genderless
									{:else}
										{(activeForm.maleRatio * 100).toFixed(0)}% M
									{/if}
								</div>
							</div>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<div class="bg-muted rounded-xl p-4">
								<div class="text-muted-foreground text-xs font-medium">Height</div>
								<div class="mt-1 text-lg font-semibold">{(activeForm.height / 10).toFixed(1)}m</div>
							</div>
							<div class="bg-muted rounded-xl p-4">
								<div class="text-muted-foreground text-xs font-medium">Weight</div>
								<div class="mt-1 text-lg font-semibold">{(activeForm.weight / 10).toFixed(1)}kg</div>
							</div>
						</div>

						{#if activeForm.abilities?.length}
							<div>
								<div class="text-muted-foreground mb-2 text-xs font-medium">Abilities</div>
								<div class="flex flex-wrap gap-2">
									{#each activeForm.abilities as ab, i (`ability-${i}-${ab.ability.id}`)}
										<Badge variant="outline" class="rounded-full">
											{ab.ability.name}
											<span class="text-muted-foreground ml-1">({ab.slot.name})</span>
										</Badge>
									{/each}
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>

		<div class="bg-background rounded-2xl border p-4">
			<div class="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
				<ListChecks class="h-4 w-4" />
				Info
			</div>
			<div class="text-muted-foreground text-sm">
				This Pokedex uses live data from the API. Form switching updates stats and moves.
			</div>
		</div>
	</div>
{/if}
