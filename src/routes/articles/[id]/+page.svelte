<script lang="ts">
	import { ArticleContent, ArticleEditor } from '$lib/components/articles';
	import { Button } from '$lib/components/ui/button';
	import { Pencil } from '@lucide/svelte';
	import type { Article } from '$lib/types/article';

	let { data }: { data: { article: Article } } = $props();

	let article = $state(data.article);
	let isEditing = $state(false);

	function handleSave(updated: Article) {
		article = updated;
		isEditing = false;
	}
</script>

{#if isEditing}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<ArticleEditor {article} onSave={handleSave} onCancel={() => (isEditing = false)} />
	</div>
{:else}
	<div class="mx-auto max-w-4xl px-4 py-4">
		<div class="flex justify-end mb-4">
			<Button variant="outline" onclick={() => (isEditing = true)}>
				<Pencil class="mr-2 h-4 w-4" />
				Edit
			</Button>
		</div>
		<ArticleContent {article} mode="full" />
	</div>
{/if}
