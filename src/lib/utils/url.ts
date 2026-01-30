export function pokemonUrl(id: number, formId?: number): string {
	const base = `/pokemon/${id}`;
	return formId ? `${base}?form=${formId}` : base;
}

export function moveUrl(id: number): string {
	return `/moves/${id}`;
}

export function abilityUrl(id: number): string {
	return `/abilities/${id}`;
}

export function itemUrl(id: number): string {
	return `/items/${id}`;
}
