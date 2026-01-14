<script lang="ts">
	import { ArticleContent } from '$lib/components/articles';
	import type { Article } from '$lib/types/article';

	let { data }: { data: { article: Article } } = $props();
</script>

<ArticleContent article={data.article} mode="full" />
