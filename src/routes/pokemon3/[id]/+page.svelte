<script lang="ts">
	import {
		PokemonDetail,
		PokemonMoves,
		PokemonDetailsTab
	} from '$lib/components/pokemon';
	import * as Tabs from '$lib/components/ui/tabs';
	import { ListChecks } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import type { Pokemon } from '../types';

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

	<PokemonDetail pokemon={data.pokemon} form={activeForm} />

	<div class="h-4"></div>

	<Tabs.Root value="moves" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2 rounded-2xl">
			<Tabs.Trigger value="moves">Moves</Tabs.Trigger>
			<Tabs.Trigger value="details">Details</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="moves" class="mt-4">
			<PokemonMoves moves={activeForm.moves} />
		</Tabs.Content>

		<Tabs.Content value="details" class="mt-4">
			<PokemonDetailsTab form={activeForm} pokemon={data.pokemon} />
		</Tabs.Content>
	</Tabs.Root>

	<div class="bg-background mt-4 rounded-2xl border p-4">
		<div class="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
			<ListChecks class="h-4 w-4" />
			Info
		</div>
		<div class="text-muted-foreground text-sm">
			This Pokedex uses live data from the API. Form switching updates stats and moves.
		</div>
	</div>
{/if}
