export interface Type {
	id: number;
	name: string;
	slug: string;
}

export interface FormType {
	type: Type;
	slot: number;
}

export interface Ability {
	id: number;
	name: string;
	slug: string;
}

export interface FormAbility {
	ability: Ability;
	slot: { id: number; slug: string; name: string };
}

export interface Move {
	move: { id: number; name: string; slug: string };
	method: { id: number; slug: string; name: string };
	level: number | null;
}

export interface SpawnCondition {
	id: number;
	type: string;
	biomes: { id: number; name: string }[];
	biomeTags: { id: number; name: string }[];
	timeRanges: { id: number; name: string }[];
	moonPhases: { id: number; name: string }[];
	weather: { id: number; name: string } | null;
	sky: { canSeeSky: boolean | null; minSkyLight: number | null; maxSkyLight: number | null } | null;
}

export interface Spawn {
	id: number;
	bucket: { id: number; name: string };
	positionType: { id: number; name: string };
	weight: number;
	levelMin: number;
	levelMax: number;
	conditions: SpawnCondition[];
}

export interface Drop {
	item: { id: number; name: string };
	percentage?: number;
	quantityMin?: number;
	quantityMax?: number;
}

export interface Drops {
	amount: number;
	percentages: Drop[];
	ranges: Drop[];
}

export interface Label {
	id: number;
	name: string;
	slug: string;
}

export interface Form {
	id: number;
	name: string;
	fullName: string;
	slug: string;
	description: string | null;
	generation: number | null;
	height: number;
	weight: number;
	catchRate: number;
	baseFriendship: number;
	eggCycles: number;
	maleRatio: number | null;
	baseScale: number | null;
	baseHp: number;
	baseAttack: number;
	baseDefence: number;
	baseSpecialAttack: number;
	baseSpecialDefence: number;
	baseSpeed: number;
	baseExperienceYield: number | null;
	evHp: number;
	evAttack: number;
	evDefence: number;
	evSpecialAttack: number;
	evSpecialDefence: number;
	evSpeed: number;
	types: FormType[];
	abilities: FormAbility[];
	moves: Move[];
	spawns?: Spawn[];
	drops?: Drops;
	labels?: Label[];
}

export interface EggGroup {
	id: number;
	name: string;
	slug: string;
}

export interface ExperienceGroup {
	id: number;
	name: string;
	slug: string;
	formula: string;
}

export interface Pokemon {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	generation: number;
	forms: Form[];
	eggGroups?: EggGroup[];
	experienceGroup?: ExperienceGroup;
}

export const TYPE_COLORS: Record<string, string> = {
	normal: 'bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-100',
	fire: 'bg-orange-500 text-white',
	water: 'bg-sky-500 text-white',
	electric: 'bg-yellow-400 text-zinc-900',
	grass: 'bg-emerald-500 text-white',
	ice: 'bg-cyan-400 text-zinc-900',
	fighting: 'bg-red-600 text-white',
	poison: 'bg-purple-600 text-white',
	ground: 'bg-amber-600 text-white',
	flying: 'bg-indigo-400 text-white',
	psychic: 'bg-pink-500 text-white',
	bug: 'bg-lime-600 text-white',
	rock: 'bg-stone-500 text-white',
	ghost: 'bg-violet-700 text-white',
	dragon: 'bg-indigo-700 text-white',
	dark: 'bg-zinc-800 text-white',
	steel: 'bg-slate-500 text-white',
	fairy: 'bg-fuchsia-400 text-zinc-900'
};

export function formatId(n: number): string {
	return '#' + String(n).padStart(4, '0');
}

export function clamp(n: number, a: number, b: number): number {
	return Math.max(a, Math.min(b, n));
}

export function getArtworkUrl(id: number): string {
	return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getStatTotal(form: Form): number {
	return (
		form.baseHp +
		form.baseAttack +
		form.baseDefence +
		form.baseSpecialAttack +
		form.baseSpecialDefence +
		form.baseSpeed
	);
}
