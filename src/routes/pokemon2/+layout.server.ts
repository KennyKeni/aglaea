import type { LayoutServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const res = await fetch(
		`${BACKEND_URL}/pokemon/search?includeTypes=true&includeAbilities=true&limit=50`
	);

	if (!res.ok) {
		return { pokemon: [] };
	}

	const pokemon = await res.json();
	return { pokemon };
};
