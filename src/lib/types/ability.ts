export interface AbilityFlag {
	id: number;
	slug: string;
	name: string;
	description: string | null;
}

export interface Ability {
	id: number;
	name: string;
	slug: string;
	desc: string | null;
	shortDesc: string | null;
	flags: AbilityFlag[];
}
