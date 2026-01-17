<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArticleEditor } from '$lib/components/articles';
	import type { Article } from '$lib/types/article';

	let { data }: { data: { article: Article } } = $props();

	function handleSave() {
		goto(`/articles/${data.article.id}`);
	}

	function handleCancel() {
		goto(`/articles/${data.article.id}`);
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<ArticleEditor
		initialTitle={data.article.title}
		initialSubtitle={data.article.subtitle ?? ''}
		initialDescription={data.article.description ?? ''}
		initialAuthor={data.article.author ?? ''}
		initialBody={data.article.body}
		editMeta={{
			id: String(data.article.id),
			createdAt: data.article.createdAt,
			categories: data.article.categories ?? [],
			images: data.article.images ?? []
		}}
		onSave={handleSave}
		onCancel={handleCancel}
	/>
</div>
