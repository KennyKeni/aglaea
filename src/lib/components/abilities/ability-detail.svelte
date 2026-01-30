<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Ability } from '$lib/types/ability';

	let { ability }: { ability: Ability } = $props();
</script>

<div class="space-y-8">
	<!-- Overview -->
	<section id="overview">
		<h2 class="mb-4 text-lg font-semibold">Overview</h2>
		<Card.Root>
			<Card.Content class="p-4">
				<div class="space-y-4">
					{#if ability.shortDesc}
						<p class="font-medium">{ability.shortDesc}</p>
					{/if}
					{#if ability.desc && ability.desc !== ability.shortDesc}
						<p class="text-sm text-muted-foreground">{ability.desc}</p>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Flags -->
	{#if ability.flags.length > 0}
		<section id="flags">
			<h2 class="mb-4 text-lg font-semibold">Flags</h2>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="space-y-2">
						{#each ability.flags as flag (flag.id)}
							<div>
								<span class="font-medium">{flag.name}</span>
								{#if flag.description}
									<span class="text-sm text-muted-foreground"> — {flag.description}</span>
								{/if}
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}
</div>
