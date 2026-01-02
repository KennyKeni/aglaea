import type { LayoutServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

const PAGE_SIZE = 50;

export const load: LayoutServerLoad = async ({ fetch }) => {
	const res = await fetch(
		`${BACKEND_URL}/pokemon/search?includeTypes=true&includeAbilities=true&limit=${PAGE_SIZE}&offset=0`
	);

	if (!res.ok) {
		return { pokemon: [], totalCount: 0 };
	}

	const pokemon = await res.json();

	return {
		pokemon,
		totalCount: 1025,
		pageSize: PAGE_SIZE
	};
};
