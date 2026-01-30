<script lang="ts">
	import { AbilityDetail } from '$lib/components/abilities';
	import DetailFooter from '$lib/components/ui/detail-footer.svelte';
	import DetailHeader from '$lib/components/ui/detail-header.svelte';
	import Toc from '$lib/components/ui/toc.svelte';
	import { abilityStore } from '$lib/state/ability-store.svelte';
	import type { Ability } from '$lib/types/ability';
	import type { TocItem } from '$lib/utils/toc';

	interface PageData {
		ability: Ability;
	}

	let { data }: { data: PageData } = $props();

	const ability = $derived(data.ability);

	const toc = $derived.by(() => {
		const items: TocItem[] = [
			{ id: 'ability-title', text: ability.name, level: 0 },
			{ id: 'overview', text: 'Overview', level: 2 },
		];
		if (ability.flags.length > 0) {
			items.push({ id: 'flags', text: 'Flags', level: 2 });
		}
		return items;
	});
</script>

<svelte:head>
	<title>{ability.name} | Abilities</title>
	<meta
		name="description"
		content={ability.shortDesc || ability.desc || `Details for ${ability.name}`}
	/>
</svelte:head>

<div class="flex min-h-svh flex-col">
	<DetailHeader title={ability.name} closeHref={abilityStore.getReturnHref('/abilities')} />

	<div class="flex-1 px-4 py-4 md:px-6 md:py-6">
		<div class="xl:grid xl:grid-cols-[1fr_auto] xl:gap-8">
			<div class="mx-auto max-w-5xl">
				<AbilityDetail {ability} />
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
