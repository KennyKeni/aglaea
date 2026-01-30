import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createMoveEndpoint } from '$lib/server/endpoints/moves';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const client = createServerClient(fetch);
	const moveApi = createMoveEndpoint(client);

	const result = await moveApi.getById(params.id, {
		includeFlags: true,
		includeBoosts: true,
		includeEffects: true,
		includeZData: true,
		includeGmaxSpecies: true,
		includeForms: true,
	});

	if (!result.ok) {
		if (result.status === 404) {
			error(404, 'Move not found');
		}
		error(result.status, result.message);
	}

	setHeaders({
		'Cache-Control': 'public, max-age=0, must-revalidate',
	});

	return { move: result.data };
};
