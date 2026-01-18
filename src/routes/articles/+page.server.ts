import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ArticleSchema, PaginatedSchema } from '$lib/types/api';
import { streamOnNav, streamMap } from '$lib/utils/streaming';

export const load: PageServerLoad = async ({ fetch, url, parent, isDataRequest }) => {
  const { totalCount, pageSize } = await parent();

  const pageParam = url.searchParams.get('page');
  const requestedPage = parseInt(pageParam ?? '1', 10);
  const categoriesParam = url.searchParams.get('categories');

  const totalPages = Math.ceil(totalCount / pageSize);
  const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

  if (requestedPage !== validPage) {
    const params = new URLSearchParams();
    params.set('page', String(validPage));
    if (categoriesParam) params.set('categories', categoriesParam);
    throw redirect(302, `/articles?${params.toString()}`);
  }

  const offset = (validPage - 1) * pageSize;

  const apiParams = new URLSearchParams({
    includeCategories: 'true',
    includeImages: 'true',
    limit: String(pageSize),
    offset: String(offset),
  });

  if (categoriesParam) {
    const categorySlugs = categoriesParam.split(',').filter(Boolean);
    categorySlugs.forEach((slug) => apiParams.append('categorySlugs', slug));
  }

  const articlesPromise = fetch(`${env.BACKEND_URL}/articles?${apiParams.toString()}`)
    .then((res) => (res.ok ? res.json() : { data: [], total: 0 }))
    .then((json) => {
      const parsed = PaginatedSchema(ArticleSchema).safeParse(json);
      return parsed.success
        ? { data: parsed.data.data ?? [], total: parsed.data.total ?? 0 }
        : { data: [], total: 0 };
    })
    .catch(() => ({ data: [], total: 0 }));

  const result = await streamOnNav(articlesPromise, isDataRequest);

  return {
    articles: streamMap(result, (r) => r.data),
    filteredCount: streamMap(result, (r) => r.total),
    currentPage: validPage,
    pageSize,
  };
};
