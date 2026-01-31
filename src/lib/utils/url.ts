const ENTITY_BASE: Record<string, string> = {
	pokemon: '/pokemon',
	moves: '/moves',
	abilities: '/abilities',
	types: '/types',
	items: '/items',
	articles: '/articles',
};

export function entityUrl(kind: string, id: number | string): string {
	const base = ENTITY_BASE[kind];
	return base ? `${base}/${id}` : `/${kind}/${id}`;
}

export function pokemonUrl(id: number, formId?: number): string {
	const base = entityUrl('pokemon', id);
	return formId ? `${base}?form=${formId}` : base;
}

export function moveUrl(id: number): string {
	return entityUrl('moves', id);
}

export function abilityUrl(id: number): string {
	return entityUrl('abilities', id);
}

export function itemUrl(id: number): string {
	return entityUrl('items', id);
}
