import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import { PokemonSchema } from '$lib/types/api';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const res = await fetch(
		`${env.BACKEND_URL}/pokemon/${params.id}?includeTypes=true&includeAbilities=true&includeMoves=true&includeSpawns=true&includeDrops=true&includeLabels=true&includeEggGroups=true&includeExperienceGroup=true`
	);

	if (!res.ok) {
		error(404, 'Pokemon not found');
	}

	setHeaders({
		'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	const json = await res.json();
	const parsed = PokemonSchema.safeParse(json);
	if (!parsed.success) {
		throw error(500, 'Invalid API response');
	}

	return { pokemon: parsed.data };
};
