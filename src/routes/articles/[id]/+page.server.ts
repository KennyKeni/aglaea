import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ArticleSchema } from '$lib/types/api';
import { jsonToHtml, RenderError } from '$lib/server/tiptap';
import { extractToc } from '$lib/utils/toc';
import { parseResponse } from '$lib/server/api';

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
  try {
    const res = await fetch(
      `${env.BACKEND_URL}/articles/${params.id}?includeCategories=true&includeImages=true&includeContent=true&includeAuthor=true`,
    );

    if (!res.ok) {
      throw error(404, 'Article not found');
    }

    setHeaders({
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    });

    const article = await parseResponse(res, ArticleSchema);
    const contentToc = article.content ? extractToc(article.content) : [];
    const toc = [{ id: 'article-title', text: article.title, level: 0 }, ...contentToc];

    let contentHtml: string | undefined;
    let renderError = false;
    if (article.content) {
      try {
        contentHtml = jsonToHtml(article.content);
      } catch (e) {
        if (e instanceof RenderError) {
          renderError = true;
        } else {
          throw e;
        }
      }
    }

    return { article: { ...article, contentHtml, renderError }, toc, panel: true };
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) {
      throw e;
    }
    throw error(500, 'Failed to load article');
  }
};
