<script lang="ts">
	import { goto } from '$app/navigation';
	import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
	import type { Article } from '$lib/types/article';

	function handleSave(article: Article) {
		goto(`/articles/${article.id}`);
	}

	function handleCancel() {
		goto('/articles');
	}

	const editorPromise = import('$lib/components/articles/article-editor.svelte');
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	{#await editorPromise}
		<LoadingSpinner class="py-20" />
	{:then { default: ArticleEditor }}
		<ArticleEditor onSave={handleSave} onCancel={handleCancel} />
	{/await}
</div>
