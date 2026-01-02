import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const queryParams = new URLSearchParams({
		includeTypes: 'true',
		includeAbilities: 'true',
		includeMoves: 'true',
		includeSpawns: 'true',
		includeDrops: 'true',
		includeLabels: 'true',
		includeEggGroups: 'true',
		includeExperienceGroup: 'true'
	});

	const res = await fetch(`${env.BACKEND_URL}/pokemon/${params.id}?${queryParams}`);

	if (!res.ok) {
		throw error(404, 'Pokemon not found');
	}

	const pokemon = await res.json();
	return { pokemon };
};
