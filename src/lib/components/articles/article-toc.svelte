<script lang="ts">
	import type { TocItem } from '$lib/utils/toc';

	let { toc, class: className = '' }: { toc: TocItem[]; class?: string } = $props();

	function scrollToHeading(e: MouseEvent, id: string) {
		e.preventDefault();
		const target = document.getElementById(id);
		if (!target) return;

		const viewport = target.closest('[data-slot="scroll-area-viewport"]');
		if (viewport) {
			const targetRect = target.getBoundingClientRect();
			const viewportRect = viewport.getBoundingClientRect();
			viewport.scrollTo({
				top: viewport.scrollTop + targetRect.top - viewportRect.top - 20,
				behavior: 'smooth'
			});
		} else {
			target.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

{#if toc.length > 0}
	<nav class="sticky top-8 {className}">
		<h2 class="text-sm font-medium text-muted-foreground mb-3">On this page</h2>
		<ul class="space-y-2">
			{#each toc as item (item.id)}
				{@const isTopLevel = item.level <= 2}
				<li style:padding-left="{(item.level - 2) * 0.75}rem">
					<a
						href="#{item.id}"
						class="text-sm hover:text-foreground transition-colors block {isTopLevel
							? 'text-muted-foreground'
							: 'text-muted-foreground/50'}"
						onclick={(e) => scrollToHeading(e, item.id)}
					>
						{item.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
