import type { LayoutServerLoad } from './$types';
import type { ArticleCategory } from '$lib/types';
import { createServerClient } from '$lib/server/client';
import { createArticlesEndpoint } from '$lib/server/endpoints/articles';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
  const client = createServerClient(fetch);
  const articlesApi = createArticlesEndpoint(client);

  const result = await articlesApi.getCategories();
  const articleCategories: ArticleCategory[] = result.ok ? result.data : [];

  return {
    session: locals.session,
    permissions: locals.permissions,
    articleCategories,
  };
};
