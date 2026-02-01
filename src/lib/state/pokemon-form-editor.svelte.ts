import type {
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
import type { FormInput, FormOverridesInput } from '$lib/api/endpoints/pokemon';

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
	formId = $state<number | null>(null);
	isNew = $state(false);

	// Form identity
	name = $state('');
	formName = $state('');
	formTypes = $state<FormType[]>([]);
	formAbilities = $state<FormAbility[]>([]);

	// Override toggles + values
	overrideCatchRate = $state(false);
	catchRate = $state(0);
	overrideBaseFriendship = $state(false);
	baseFriendship = $state(0);
	overrideEggCycles = $state(false);
	eggCycles = $state(0);
	overrideMaleRatio = $state(false);
	maleRatio = $state<number | null>(null);
	overrideBaseScale = $state(false);
	baseScale = $state<number | null>(null);

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
	baseExperienceYield = $state<number | null>(null);

	// Physical
	height = $state(0);
	weight = $state(0);

	// Cover image
	coverImageId = $state<string | null>(null);
	coverImageUrl = $state<string | null>(null);

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

	initFromForm(
		form: Form,
		speciesDefaults: {
			catchRate: number;
			baseFriendship: number;
			eggCycles: number;
			maleRatio: number | null;
			baseScale: number | null;
		},
	) {
		this.formId = form.id;
		this.isNew = false;

		this.name = form.name;
		this.formName = form.fullName;
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

		this.baseExperienceYield = form.baseExperienceYield;
		this.height = form.height;
		this.weight = form.weight;

		// Override toggles: on if override exists, value from override; otherwise from species default
		const ov = form.overrides;
		this.overrideCatchRate = ov?.catchRate !== undefined;
		this.catchRate = ov?.catchRate ?? speciesDefaults.catchRate;
		this.overrideBaseFriendship = ov?.baseFriendship !== undefined;
		this.baseFriendship = ov?.baseFriendship ?? speciesDefaults.baseFriendship;
		this.overrideEggCycles = ov?.eggCycles !== undefined;
		this.eggCycles = ov?.eggCycles ?? speciesDefaults.eggCycles;
		this.overrideMaleRatio = ov?.maleRatio !== undefined;
		this.maleRatio = ov?.maleRatio !== undefined ? ov.maleRatio : speciesDefaults.maleRatio;
		this.overrideBaseScale = ov?.baseScale !== undefined;
		this.baseScale = ov?.baseScale !== undefined ? ov.baseScale : speciesDefaults.baseScale;

		this.coverImageId = form.image?.id ?? null;
		this.coverImageUrl = form.image?.url ?? null;
	}

	toFormInput(speciesId?: number): FormInput {
		const overrides: FormOverridesInput = {};
		let hasOverrides = false;

		if (this.overrideCatchRate) {
			overrides.catchRate = this.catchRate;
			hasOverrides = true;
		}
		if (this.overrideBaseFriendship) {
			overrides.baseFriendship = this.baseFriendship;
			hasOverrides = true;
		}
		if (this.overrideEggCycles) {
			overrides.eggCycles = this.eggCycles;
			hasOverrides = true;
		}
		if (this.overrideMaleRatio) {
			overrides.maleRatio = this.maleRatio;
			hasOverrides = true;
		}
		if (this.overrideBaseScale) {
			overrides.baseScale = this.baseScale;
			hasOverrides = true;
		}

		return {
			name: this.name,
			formName: this.formName,
			...(speciesId != null ? { speciesId } : {}),
			height: this.height,
			weight: this.weight,
			baseExperienceYield: this.baseExperienceYield,
			overrides: hasOverrides ? overrides : null,
			baseHp: this.baseStats.hp,
			baseAttack: this.baseStats.attack,
			baseDefence: this.baseStats.defence,
			baseSpecialAttack: this.baseStats.specialAttack,
			baseSpecialDefence: this.baseStats.specialDefence,
			baseSpeed: this.baseStats.speed,
			evHp: this.evs.hp,
			evAttack: this.evs.attack,
			evDefence: this.evs.defence,
			evSpecialAttack: this.evs.specialAttack,
			evSpecialDefence: this.evs.specialDefence,
			evSpeed: this.evs.speed,
			types: this.formTypes.map((t) => ({ typeId: t.type.id, slot: t.slot })),
			abilities: this.formAbilities.map((a) => ({ abilityId: a.ability.id, slotId: a.slot.id })),
			moves: this.formMoves.map((m) => ({
				moveId: m.move.id,
				methodId: m.method.id,
				level: m.level,
			})),
			labelIds: this.formLabels.map((l) => l.id),
		};
	}
}

export function createPokemonFormEditor(): PokemonFormEditor {
	return new PokemonFormEditor();
}
