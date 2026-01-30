export interface NamespaceRef {
	id: number;
	slug: string;
	name: string;
}

export interface ItemStatRef {
	id: number;
	slug: string;
	name: string;
}

export interface ItemBoost {
	stat: ItemStatRef;
	stages: number;
}

export interface ItemFlag {
	id: number;
	slug: string;
	name: string;
}

export interface ItemTag {
	id: number;
	slug: string;
	name: string;
}

export interface RecipeType {
	id: number;
	slug: string;
	name: string;
}

export interface RecipeSlotType {
	id: number;
	slug: string;
	name: string;
	description: string | null;
}

export interface ItemRef {
	id: number;
	name: string;
}

export interface RecipeInput {
	item: ItemRef;
	slot: number | null;
	slotType: RecipeSlotType | null;
}

export interface RecipeTagType {
	id: number;
	slug: string;
	name: string;
}

export interface RecipeTagInput {
	tag: RecipeTagType;
	slot: number | null;
	slotType: RecipeSlotType | null;
}

export interface Recipe {
	id: number;
	type: RecipeType;
	resultCount: number;
	experience: number | null;
	cookingTime: number | null;
	inputs: RecipeInput[];
	tagInputs: RecipeTagInput[];
}

export interface Item {
	id: number;
	slug: string;
	name: string;
	num: number | null;
	desc: string | null;
	shortDesc: string | null;
	generation: number | null;
	namespace: NamespaceRef | null;
	implemented: boolean;
	boosts: ItemBoost[];
	flags: ItemFlag[];
	tags: ItemTag[];
	recipes: Recipe[];
}
