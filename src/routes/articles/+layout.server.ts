import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { ArticleSchema, ArticleCategorySchema, PaginatedSchema } from '$lib/types/api';
import { parseResponse } from '$lib/utils';
import { z } from 'zod';

const PAGE_SIZE = 12;

export const load: LayoutServerLoad = async ({ fetch }) => {
  const [articlesRes, categoriesRes] = await Promise.all([
    fetch(`${env.BACKEND_URL}/articles?limit=1&offset=0`).catch(() => null),
    fetch(`${env.BACKEND_URL}/articles/categories`).catch(() => null),
  ]);

  let totalCount = 0;
  if (articlesRes?.ok) {
    try {
      const data = await parseResponse(articlesRes, PaginatedSchema(ArticleSchema));
      totalCount = data.total ?? 0;
    } catch {
      // Ignore parse errors
    }
  }

  let categories: z.infer<typeof ArticleCategorySchema>[] = [];
  if (categoriesRes?.ok) {
    try {
      categories = await parseResponse(categoriesRes, z.array(ArticleCategorySchema));
    } catch {
      // Ignore parse errors
    }
  }

  return {
    totalCount,
    pageSize: PAGE_SIZE,
    categories,
  };
};
