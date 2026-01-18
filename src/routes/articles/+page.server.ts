import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ArticleSchema, PaginatedSchema } from '$lib/types/api';

export const load: PageServerLoad = async ({ fetch, url, parent, isDataRequest }) => {
  const { totalCount, pageSize } = await parent();

  const pageParam = url.searchParams.get('page');
  const requestedPage = parseInt(pageParam ?? '1', 10);

  const totalPages = Math.ceil(totalCount / pageSize);
  const validPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

  if (requestedPage !== validPage) {
    throw redirect(302, `/articles?page=${validPage}`);
  }

  const offset = (validPage - 1) * pageSize;

  const articlesPromise = fetch(
    `${env.BACKEND_URL}/articles?includeCategories=true&includeImages=true&limit=${pageSize}&offset=${offset}`,
  )
    .then((res) => (res.ok ? res.json() : { data: [] }))
    .then((json) => {
      const parsed = PaginatedSchema(ArticleSchema).safeParse(json);
      return parsed.success ? (parsed.data.data ?? []) : [];
    })
    .catch(() => []);

  return {
    articles: isDataRequest ? articlesPromise : await articlesPromise,
    currentPage: validPage,
    pageSize,
  };
};
