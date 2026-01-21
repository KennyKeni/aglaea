import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createArticlesEndpoint } from '$lib/server/endpoints/articles';

export const load: PageServerLoad = async ({ fetch, params }) => {
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

  return { article: result.data };
};
