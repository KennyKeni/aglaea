import type {
	Pokemon,
	Form,
	FormType,
	FormAbility,
	FormMove,
	Spawn,
	Drops,
	LabelRef,
	AbilitySlot,
} from '$lib/types/pokemon';
import type { SearchResult } from '$lib/types/search';

export interface BaseStats {
	hp: number;
	attack: number;
	defence: number;
	specialAttack: number;
	specialDefence: number;
	speed: number;
}

export interface Evs {
	hp: number;
	attack: number;
	defence: number;
	specialAttack: number;
	specialDefence: number;
	speed: number;
}

const ABILITY_SLOTS: AbilitySlot[] = [
	{ id: 1, slug: 'primary', name: 'Primary' },
	{ id: 2, slug: 'secondary', name: 'Secondary' },
	{ id: 3, slug: 'hidden', name: 'Hidden' },
];

export class PokemonFormEditor {
	// Species
	speciesName = $state('');
	speciesDescription = $state<string | null>(null);
	speciesGeneration = $state(1);
	speciesExperienceGroupId = $state<number | null>(null);
	speciesEggGroupIds = $state<number[]>([]);

	// Form identity
	formName = $state('');
	formTypes = $state<FormType[]>([]);
	formAbilities = $state<FormAbility[]>([]);

	// Base stats
	baseStats = $state<BaseStats>({
		hp: 0,
		attack: 0,
		defence: 0,
		specialAttack: 0,
		specialDefence: 0,
		speed: 0,
	});

	// EVs
	evs = $state<Evs>({
		hp: 0,
		attack: 0,
		defence: 0,
		specialAttack: 0,
		specialDefence: 0,
		speed: 0,
	});

	// Training
	catchRate = $state(0);
	baseFriendship = $state(0);
	baseExperienceYield = $state<number | null>(null);
	eggCycles = $state(0);
	maleRatio = $state<number | null>(null);

	// Physical
	height = $state(0);
	weight = $state(0);
	baseScale = $state<number | null>(null);

	// Collections
	formLabels = $state<LabelRef[]>([]);
	formSpawns = $state<Spawn[]>([]);
	formDrops = $state<Drops | null>(null);
	formMoves = $state<FormMove[]>([]);

	get statTotal(): number {
		const s = this.baseStats;
		return s.hp + s.attack + s.defence + s.specialAttack + s.specialDefence + s.speed;
	}

	setBaseStat(key: string, value: number) {
		const num = Math.max(0, Math.min(255, value || 0));
		this.baseStats = { ...this.baseStats, [key]: num };
	}

	setEv(key: string, value: number) {
		const num = Math.max(0, Math.min(3, value || 0));
		this.evs = { ...this.evs, [key]: num };
	}

	addType(result: SearchResult) {
		if (this.formTypes.some((t) => t.type.id === result.id)) return;
		this.formTypes = [
			...this.formTypes,
			{
				type: { id: result.id, name: result.name, slug: result.slug },
				slot: this.formTypes.length + 1,
			},
		];
	}

	removeType(index: number) {
		this.formTypes = this.formTypes.filter((_, i) => i !== index);
	}

	addAbility(result: SearchResult) {
		if (this.formAbilities.some((a) => a.ability.id === result.id)) return;
		const usedSlotIds = new Set(this.formAbilities.map((a) => a.slot.id));
		const nextSlot = ABILITY_SLOTS.find((s) => !usedSlotIds.has(s.id)) ?? ABILITY_SLOTS[0]!;
		this.formAbilities = [
			...this.formAbilities,
			{
				ability: { id: result.id, name: result.name, slug: result.slug },
				slot: nextSlot,
			},
		];
	}

	removeAbility(index: number) {
		this.formAbilities = this.formAbilities.filter((_, i) => i !== index);
	}

	removeLabel(index: number) {
		this.formLabels = this.formLabels.filter((_, i) => i !== index);
	}

	initFromPokemon(pokemon: Pokemon, form: Form) {
		this.speciesName = pokemon.name;
		this.speciesDescription = pokemon.description;
		this.speciesGeneration = pokemon.generation;
		this.speciesExperienceGroupId = pokemon.experienceGroup?.id ?? null;
		this.speciesEggGroupIds = pokemon.eggGroups.map((g) => g.id);

		this.formName = form.name;
		this.formTypes = structuredClone(form.types);
		this.formAbilities = structuredClone(form.abilities);
		this.formMoves = structuredClone(form.moves);
		this.formLabels = structuredClone(form.labels);
		this.formSpawns = structuredClone(form.spawns);
		this.formDrops = form.drops ? structuredClone(form.drops) : null;

		this.baseStats = {
			hp: form.baseHp,
			attack: form.baseAttack,
			defence: form.baseDefence,
			specialAttack: form.baseSpecialAttack,
			specialDefence: form.baseSpecialDefence,
			speed: form.baseSpeed,
		};

		this.evs = {
			hp: form.evHp,
			attack: form.evAttack,
			defence: form.evDefence,
			specialAttack: form.evSpecialAttack,
			specialDefence: form.evSpecialDefence,
			speed: form.evSpeed,
		};

		this.catchRate = form.catchRate;
		this.baseFriendship = form.baseFriendship;
		this.baseExperienceYield = form.baseExperienceYield;
		this.eggCycles = form.eggCycles;
		this.maleRatio = form.maleRatio;
		this.height = form.height;
		this.weight = form.weight;
		this.baseScale = form.baseScale;
	}
}

export function createPokemonFormEditor(): PokemonFormEditor {
	return new PokemonFormEditor();
}
