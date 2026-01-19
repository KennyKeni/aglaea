import type { LayoutServerLoad } from './$types';

const PAGE_SIZE = 24;

export const load: LayoutServerLoad = () => {
  return {
    pageSize: PAGE_SIZE,
  };
};
