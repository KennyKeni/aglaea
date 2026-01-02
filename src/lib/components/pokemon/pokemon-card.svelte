<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils';
	import { TYPE_COLORS, formatId, getArtworkUrl, type Pokemon } from '$lib/types/pokemon';

	let { pokemon, onclick }: { pokemon: Pokemon; onclick: () => void } = $props();
	let defaultForm = $derived(pokemon.forms[0]);
</script>

<button {onclick} class="group text-left">
	<Card.Root
		class="hover:border-primary/30 rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"
	>
		<Card.Header class="pb-2">
			<div class="flex items-start justify-between gap-3">
				<div>
					<div class="text-muted-foreground text-xs font-medium">{formatId(pokemon.id)}</div>
					<Card.Title class="text-base">{pokemon.name}</Card.Title>
				</div>
				<img
					src={getArtworkUrl(pokemon.id)}
					alt={pokemon.name}
					class="bg-muted h-14 w-14 rounded-xl object-contain"
				/>
			</div>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex flex-wrap gap-2">
				{#each defaultForm.types as { type } (type.id)}
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
			<div class="text-muted-foreground line-clamp-2 text-sm">
				{pokemon.description || ''}
			</div>
			<div class="text-muted-foreground flex items-center justify-between text-xs">
				<span class="bg-muted rounded-full px-2 py-1">Click to preview</span>
			</div>
		</Card.Content>
	</Card.Root>
</button>
