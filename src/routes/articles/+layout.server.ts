import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { ArticleSchema, PaginatedSchema } from '$lib/types/api';
import { parseResponse } from '$lib/utils';

const PAGE_SIZE = 12;

export const load: LayoutServerLoad = async ({ fetch, parent }) => {
  const [articlesRes, parentData] = await Promise.all([
    fetch(`${env.BACKEND_URL}/articles?limit=1&offset=0`).catch(() => null),
    parent(),
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

  return {
    totalCount,
    pageSize: PAGE_SIZE,
    categories: parentData.articleCategories,
  };
};
