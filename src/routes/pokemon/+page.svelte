<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Maximize2 } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { TYPE_COLORS, formatId, getArtworkUrl, getStatTotal, clamp, type Pokemon } from './types';

	interface PageData {
		pokemon: Pokemon[];
	}

	let { data }: { data: PageData } = $props();

	let focusId = $derived(page.url.searchParams.get('focus'));
	let focusedPokemon = $derived(
		focusId ? data.pokemon.find((p) => String(p.id) === focusId) : null
	);
	let formIndex = $state(0);
	let activeForm = $derived(focusedPokemon?.forms[formIndex] ?? null);

	$effect(() => {
		if (focusId) formIndex = 0;
	});

	function expand() {
		if (focusId) {
			goto(`/pokemon/${focusId}`, { noScroll: true });
		}
	}
</script>

{#if focusedPokemon && activeForm}
	{#if focusedPokemon.forms.length > 1}
		<div class="mb-4 flex flex-wrap items-center gap-2">
			<span class="text-muted-foreground text-xs">Form:</span>
			{#each focusedPokemon.forms as form, idx (`${focusedPokemon.id}-form-${idx}`)}
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
								src={getArtworkUrl(focusedPokemon.id)}
								alt={activeForm.name}
								class="h-full w-full object-contain"
							/>
						</div>
						<div class="mt-3 text-center">
							<div class="text-sm font-semibold">
								{activeForm.name}
							</div>
							{#if activeForm.description}
								<div class="text-muted-foreground mt-1 text-sm">
									{activeForm.description}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="space-y-3 md:col-span-8">
					<div class="flex items-start justify-between gap-3">
						<div>
							<div class="text-muted-foreground text-xs font-medium">
								{formatId(focusedPokemon.id)}
							</div>
							<div class="text-xl font-semibold">
								{focusedPokemon.name}
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

					{#if focusedPokemon.description}
						<div class="text-muted-foreground bg-background rounded-2xl border p-4 text-sm">
							{focusedPokemon.description}
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
						<div class="flex items-start justify-between gap-3">
							<div>
								<Card.Title class="text-base">Moves</Card.Title>
								<div class="text-muted-foreground mt-1 text-sm">Expand for full list</div>
							</div>
							<Button variant="outline" size="sm" onclick={expand}>
								<Maximize2 class="mr-2 h-4 w-4" />
								Expand
							</Button>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="space-y-2">
							{#each Array(4) as _, i (i)}
								<Skeleton class="h-14 w-full rounded-xl" />
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="details" class="mt-4">
				<Card.Root class="rounded-2xl">
					<Card.Header class="pb-3">
						<div class="flex items-start justify-between gap-3">
							<div>
								<Card.Title class="text-base">Details</Card.Title>
								<div class="text-muted-foreground mt-1 text-sm">Expand for full info</div>
							</div>
							<Button variant="outline" size="sm" onclick={expand}>
								<Maximize2 class="mr-2 h-4 w-4" />
								Expand
							</Button>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each Array(4) as _, i (i)}
								<Skeleton class="h-20 w-full rounded-xl" />
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	</div>
{/if}
