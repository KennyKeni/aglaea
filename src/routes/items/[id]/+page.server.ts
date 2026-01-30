import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createItemEndpoint } from '$lib/server/endpoints/items';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const client = createServerClient(fetch);
	const itemApi = createItemEndpoint(client);

	const result = await itemApi.getById(params.id, {
		includeBoosts: true,
		includeFlags: true,
		includeTags: true,
		includeRecipes: true,
	});

	if (!result.ok) {
		if (result.status === 404) {
			error(404, 'Item not found');
		}
		error(result.status, result.message);
	}

	setHeaders({
		'Cache-Control': 'public, max-age=0, must-revalidate',
	});

	return { item: result.data };
};
