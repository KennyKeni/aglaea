<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn } from '$lib/utils';
	import { TYPE_COLORS, formatId, getArtworkUrl } from '$lib/utils/pokemon';
	import type { Pokemon } from '$lib/types/pokemon';

	let {
		pokemon,
		loading = false,
		onclick
	}: {
		pokemon?: Pokemon;
		loading?: boolean;
		onclick?: () => void;
	} = $props();

	let defaultForm = $derived(pokemon?.forms[0]);
</script>

{#if loading}
	<div class="bg-card aspect-square rounded-2xl border p-4">
		<div class="flex h-full flex-col">
			<div class="grid grid-cols-[1fr_auto] gap-3 flex-1">
				<div class="space-y-2">
					<Skeleton class="h-3 w-12" />
					<Skeleton class="h-5 w-24" />
					<div class="flex gap-1.5 mt-2">
						<Skeleton class="h-5 w-14 rounded-full" />
						<Skeleton class="h-5 w-12 rounded-full" />
					</div>
				</div>
				<Skeleton class="w-28 h-28 rounded-xl shrink-0" />
			</div>
			<Skeleton class="h-12 w-full mt-3" />
		</div>
	</div>
{:else if pokemon}
	<button {onclick} class="group text-left w-full">
		<Card.Root
			class="hover:border-primary/30 aspect-square rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"
		>
			<Card.Content class="flex h-full flex-col px-4 pt-2 pb-4">
				<div class="grid grid-cols-[1fr_auto] gap-3 flex-1">
					<div class="flex flex-col justify-between min-w-0">
						<div>
							<div class="text-muted-foreground text-xs font-medium">{formatId(pokemon.id)}</div>
							<div class="text-base font-semibold truncate">{pokemon.name}</div>
						</div>
						<div class="flex flex-wrap gap-1.5 mt-2">
							{#each defaultForm?.types ?? [] as { type } (type.id)}
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
					<div class="bg-muted rounded-xl p-2 flex items-center justify-center w-28 h-28 shrink-0">
						<img
							src={getArtworkUrl(pokemon.id)}
							alt={pokemon.name}
							class="max-h-full max-w-full object-contain"
						/>
					</div>
				</div>
				<div class="text-muted-foreground line-clamp-3 text-sm mt-3">
					{pokemon.description || ''}
				</div>
			</Card.Content>
		</Card.Root>
	</button>
{/if}
