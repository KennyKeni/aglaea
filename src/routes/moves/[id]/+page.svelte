<script lang="ts">
	import { MoveDetail } from '$lib/components/moves';
	import DetailFooter from '$lib/components/ui/detail-footer.svelte';
	import DetailHeader from '$lib/components/ui/detail-header.svelte';
	import Toc from '$lib/components/ui/toc.svelte';
	import { moveStore } from '$lib/state/move-store.svelte';
	import type { Move } from '$lib/types/move';
	import type { TocItem } from '$lib/utils/toc';

	interface PageData {
		move: Move;
	}

	let { data }: { data: PageData } = $props();

	const move = $derived(data.move);

	const toc = $derived.by(() => {
		const items: TocItem[] = [
			{ id: 'move-title', text: move.name, level: 0 },
			{ id: 'overview', text: 'Overview', level: 2 },
		];
		if (move.flags.length > 0) {
			items.push({ id: 'flags', text: 'Flags', level: 2 });
		}
		if (move.boosts.length > 0) {
			items.push({ id: 'boosts', text: 'Stat Changes', level: 2 });
		}
		if (move.effects.length > 0) {
			items.push({ id: 'effects', text: 'Effects', level: 2 });
		}
		if (move.zData) {
			items.push({ id: 'z-data', text: 'Z-Move Data', level: 2 });
		}
		if (move.gmaxSpecies.length > 0) {
			items.push({ id: 'gmax-species', text: 'G-Max Species', level: 2 });
		}
		return items;
	});
</script>

<svelte:head>
	<title>{move.name} | Moves</title>
	<meta name="description" content={move.shortDesc || move.desc || `Details for ${move.name}`} />
</svelte:head>

<div class="flex min-h-svh flex-col">
	<DetailHeader title={move.name} closeHref={moveStore.getReturnHref('/moves')} />

	<div class="flex-1 px-4 py-4 md:px-6 md:py-6">
		<div class="xl:grid xl:grid-cols-[1fr_auto] xl:gap-8">
			<div class="mx-auto max-w-5xl">
				<MoveDetail {move} />
			</div>
			{#if toc.length > 0}
				<aside class="hidden xl:block">
					<Toc {toc} />
				</aside>
			{/if}
		</div>
	</div>

	<DetailFooter />
</div>
