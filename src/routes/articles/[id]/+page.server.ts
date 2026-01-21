import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createArticlesEndpoint } from '$lib/server/endpoints/articles';
import { extractToc } from '$lib/utils/toc';

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
  const client = createServerClient(fetch);
  const articles = createArticlesEndpoint(client);

  const result = await articles.getById(params.id, {
    includeCategories: true,
    includeImages: true,
    includeContent: true,
    includeAuthor: true,
  });

  if (!result.ok) {
    if (result.status === 404) {
      throw error(404, 'Article not found');
    }
    throw error(result.status, result.message);
  }

  setHeaders({
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  });

  const article = result.data;
  const contentToc = article.content ? extractToc(article.content) : [];
  const toc = [{ id: 'article-title', text: article.title, level: 0 }, ...contentToc];

  const renderError = !!(article.content && !article.contentHtml);

  return { article: { ...article, renderError }, toc };
};
