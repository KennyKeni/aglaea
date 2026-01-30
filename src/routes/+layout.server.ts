import type { LayoutServerLoad } from './$types';
import type { ArticleCategory } from '$lib/types';
import { createServerClient } from '$lib/server/client';
import { createArticlesEndpoint } from '$lib/server/endpoints/articles';
import { createMoveEndpoint } from '$lib/server/endpoints/moves';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
  const client = createServerClient(fetch);
  const articlesApi = createArticlesEndpoint(client);
  const movesApi = createMoveEndpoint(client);

  const [articlesResult, moveCategoriesResult] = await Promise.all([
    articlesApi.getCategories(),
    movesApi.getCategories(),
  ]);

  const articleCategories: ArticleCategory[] = articlesResult.ok ? articlesResult.data : [];
  const moveCategories = moveCategoriesResult.ok ? moveCategoriesResult.data.data : [];

  return {
    session: locals.session,
    permissions: locals.permissions,
    articleCategories,
    moveCategories,
  };
};
