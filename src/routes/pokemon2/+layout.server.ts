import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const res = await fetch(
		`${env.BACKEND_URL}/pokemon/search?includeTypes=true&includeAbilities=true&limit=50`
	);

	if (!res.ok) {
		return { pokemon: [] };
	}

	const pokemon = await res.json();
	return { pokemon };
};
