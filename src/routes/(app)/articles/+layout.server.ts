import type { LayoutServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: LayoutServerLoad = () => {
  return {
    pageSize: PAGE_SIZE,
  };
};
