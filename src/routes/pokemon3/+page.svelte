<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		PokemonDetail,
		PokemonMoves,
		PokemonDetailsTab
	} from '$lib/components/pokemon';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Maximize2 } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import type { Pokemon } from './types';

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
			goto(`/pokemon3/${focusId}`, { noScroll: true });
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

	<PokemonDetail pokemon={focusedPokemon} form={activeForm} />

	<div class="h-4"></div>

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
{/if}
