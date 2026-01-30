import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServerClient } from '$lib/server/client';
import { createAbilityEndpoint } from '$lib/server/endpoints/abilities';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const client = createServerClient(fetch);
	const abilityApi = createAbilityEndpoint(client);

	const result = await abilityApi.getById(params.id, {
		includeFlags: true,
		includeForms: true,
	});

	if (!result.ok) {
		if (result.status === 404) {
			error(404, 'Ability not found');
		}
		error(result.status, result.message);
	}

	setHeaders({
		'Cache-Control': 'public, max-age=0, must-revalidate',
	});

	return { ability: result.data };
};
