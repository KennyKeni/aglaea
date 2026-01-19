import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ArticleSchema, ArticleCategorySchema, PaginatedSchema } from '$lib/types/api';
import { parseResponse } from '$lib/server/api';
import { streamOnNav, type Streamable } from '$lib/utils/streaming';
import { z } from 'zod';

const PAGE_SIZE = 12;

type FilterOption = { id: number; slug: string; name: string };

async function fetchArticles(
  fetch: typeof globalThis.fetch,
  apiParams: URLSearchParams
): Promise<{ articles: z.infer<typeof ArticleSchema>[]; filteredCount: number }> {
  const res = await fetch(`${env.BACKEND_URL}/articles?${apiParams.toString()}`).catch(() => null);
  if (!res?.ok) return { articles: [], filteredCount: 0 };
  try {
    const data = await parseResponse(res, PaginatedSchema(ArticleSchema));
    return { articles: data.data ?? [], filteredCount: data.total ?? 0 };
  } catch {
    return { articles: [], filteredCount: 0 };
  }
}

async function fetchCategories(fetch: typeof globalThis.fetch): Promise<FilterOption[]> {
  const res = await fetch(`${env.BACKEND_URL}/articles/categories`).catch(() => null);
  if (!res?.ok) return [];
  try {
    const data = await parseResponse(res, z.array(ArticleCategorySchema));
    return data.map((c) => ({ id: c.id, slug: c.slug, name: c.name }));
  } catch {
    return [];
  }
}

export const load: PageServerLoad = async ({ fetch, url, isDataRequest }) => {
  const pageParam = url.searchParams.get('page');
  const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10));
  const categoriesParam = url.searchParams.get('categories');

  const offset = (requestedPage - 1) * PAGE_SIZE;

  const apiParams = new URLSearchParams({
    includeCategories: 'true',
    includeImages: 'true',
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });

  if (categoriesParam) {
    const categorySlugs = categoriesParam.split(',').filter(Boolean);
    categorySlugs.forEach((slug) => apiParams.append('categorySlugs', slug));
  }

  const articlesPromise = fetchArticles(fetch, apiParams);
  const categoriesPromise = fetchCategories(fetch);

  const articlesResult = await streamOnNav(articlesPromise, isDataRequest);
  const categories = await streamOnNav(categoriesPromise, isDataRequest);

  // Page validation only on SSR (when we have resolved data)
  if (!isDataRequest && !(articlesResult instanceof Promise)) {
    const totalPages = Math.ceil(articlesResult.filteredCount / PAGE_SIZE);
    const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));
    if (requestedPage !== validPage && articlesResult.filteredCount > 0) {
      const params = new URLSearchParams(url.searchParams);
      params.set('page', String(validPage));
      throw redirect(302, `/articles?${params.toString()}`);
    }
  }

  const articles: Streamable<z.infer<typeof ArticleSchema>[]> =
    articlesResult instanceof Promise ? articlesResult.then((r) => r.articles) : articlesResult.articles;
  const filteredCount: Streamable<number> =
    articlesResult instanceof Promise ? articlesResult.then((r) => r.filteredCount) : articlesResult.filteredCount;

  return {
    articles,
    filteredCount,
    currentPage: requestedPage,
    pageSize: PAGE_SIZE,
    categories,
  };
};
