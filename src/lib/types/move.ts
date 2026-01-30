import type { FormRef, NamedRef } from './base';

export interface MoveCategory {
	id: number;
	slug: string;
	name: string;
	description: string | null;
}

export interface MoveTarget {
	id: number;
	slug: string;
	name: string;
	description: string | null;
}

export interface MoveFlag {
	id: number;
	slug: string;
	name: string;
	description: string | null;
}

export interface StatRef {
	id: number;
	slug: string;
	name: string;
}

export interface MoveBoost {
	stat: StatRef;
	stages: number;
	isSelf: boolean;
}

export interface ConditionType {
	id: number;
	slug: string;
	name: string;
}

export interface Condition {
	id: number;
	slug: string;
	name: string;
	type: ConditionType;
	description: string | null;
}

export interface MoveEffect {
	conditionType: ConditionType;
	condition: Condition | null;
	chance: number;
	isSelf: boolean;
}

export interface MoveZData {
	zPower: number | null;
	zEffect: string | null;
	zCrystal: string | null;
	isZExclusive: boolean;
}

export interface Move {
	id: number;
	name: string;
	slug: string;
	desc: string | null;
	shortDesc: string | null;
	type: NamedRef;
	category: MoveCategory;
	target: MoveTarget | null;
	power: number | null;
	accuracy: number | null;
	pp: number;
	priority: number;
	critRatio: number | null;
	minHits: number | null;
	maxHits: number | null;
	drainPercent: number | null;
	healPercent: number | null;
	recoilPercent: number | null;
	flags: MoveFlag[];
	boosts: MoveBoost[];
	effects: MoveEffect[];
	maxPower: number | null;
	zData: MoveZData | null;
	gmaxSpecies: NamedRef[];
	forms: FormRef[];
}
