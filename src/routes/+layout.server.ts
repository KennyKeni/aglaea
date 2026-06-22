import type { LayoutServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createMoveEndpoint } from '$lib/server/endpoints/moves';

export const load: LayoutServerLoad = async ({ fetch }) => {
  const client = createServerClient(fetch);
  const movesApi = createMoveEndpoint(client);

  const moveCategoriesResult = await movesApi.getCategories();

  const moveCategories = moveCategoriesResult.ok ? moveCategoriesResult.data.data : [];

  return {
    moveCategories,
  };
};
