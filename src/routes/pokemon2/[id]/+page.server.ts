import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(
		`${env.BACKEND_URL}/pokemon/${params.id}?includeTypes=true&includeAbilities=true&includeMoves=true`
	);

	if (!res.ok) {
		throw error(404, 'Pokemon not found');
	}

	const pokemon = await res.json();
	return { pokemon };
};
