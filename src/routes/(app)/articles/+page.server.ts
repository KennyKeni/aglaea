import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createArticlesEndpoint } from '$lib/server/endpoints/articles';
import type { Article, ArticleCategory } from '$lib/types/api';

const PAGE_SIZE = 12;

type FilterOption = { id: number; slug: string; name: string };

export const load: PageServerLoad = async ({ fetch, url, isDataRequest }) => {
  const client = createServerClient(fetch);
  const articlesApi = createArticlesEndpoint(client);

  async function fetchArticles(
    categorySlugs: string[] | undefined,
    offset: number,
  ): Promise<{ articles: Article[]; filteredCount: number }> {
    const result = await articlesApi.search({
      includeCategories: true,
      includeImages: true,
      limit: PAGE_SIZE,
      offset,
      ...(categorySlugs && { categorySlugs }),
    });
    if (!result.ok) return { articles: [], filteredCount: 0 };
    return { articles: result.data.data ?? [], filteredCount: result.data.total ?? 0 };
  }

  async function fetchCategories(): Promise<FilterOption[]> {
    const result = await articlesApi.getCategories();
    if (!result.ok) return [];
    return result.data.map((c: ArticleCategory) => ({ id: c.id, slug: c.slug, name: c.name }));
  }

  const pageParam = url.searchParams.get('page');
  const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10));
  const categoriesParam = url.searchParams.get('categories');

  const offset = (requestedPage - 1) * PAGE_SIZE;
  const categorySlugs = categoriesParam ? categoriesParam.split(',').filter(Boolean) : undefined;

  const articlesPromise = fetchArticles(categorySlugs, offset);
  const categoriesPromise = fetchCategories();

  // Client navigation: return promises directly for streaming
  if (isDataRequest) {
    return {
      articles: articlesPromise.then((r) => r.articles),
      filteredCount: articlesPromise.then((r) => r.filteredCount),
      currentPage: requestedPage,
      pageSize: PAGE_SIZE,
      categories: categoriesPromise,
    };
  }

  // SSR: await everything for full HTML
  const [articlesResult, categories] = await Promise.all([articlesPromise, categoriesPromise]);

  // Page validation only on SSR
  const totalPages = Math.ceil(articlesResult.filteredCount / PAGE_SIZE);
  const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));
  if (requestedPage !== validPage && articlesResult.filteredCount > 0) {
    const params = new URLSearchParams(url.searchParams);
    params.set('page', String(validPage));
    throw redirect(302, `/articles?${params.toString()}`);
  }

  return {
    articles: articlesResult.articles,
    filteredCount: articlesResult.filteredCount,
    currentPage: validPage,
    pageSize: PAGE_SIZE,
    categories,
  };
};
