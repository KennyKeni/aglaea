import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { ArticleCategorySchema } from '$lib/types/api';
import { parseResponse } from '$lib/utils';
import { z } from 'zod';
import type { ArticleCategory } from '$lib/types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
  const categoriesRes = await fetch(`${env.BACKEND_URL}/articles/categories`).catch(() => null);

  let articleCategories: ArticleCategory[] = [];
  if (categoriesRes?.ok) {
    try {
      articleCategories = await parseResponse(categoriesRes, z.array(ArticleCategorySchema));
    } catch {
      // Ignore parse errors
    }
  }

  return {
    session: locals.session,
    permissions: locals.permissions,
    articleCategories,
  };
};
