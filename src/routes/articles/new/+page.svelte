<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArticleEditor } from '$lib/components/articles';
	import type { Article } from '$lib/types/article';

	function handleSave(article: Article) {
		goto(`/articles/${article.id}`);
	}

	function handleCancel() {
		goto('/articles');
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<ArticleEditor onSave={handleSave} onCancel={handleCancel} />
</div>
