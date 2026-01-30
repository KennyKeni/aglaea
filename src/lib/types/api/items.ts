import { z } from 'zod';

const NamespaceRefSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

const StatRefSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

const ItemRefSchema = z.object({
	id: z.number(),
	name: z.string(),
});

export const ItemBoostSchema = z.object({
	stat: StatRefSchema,
	stages: z.number(),
});

export const ItemFlagSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

export const ItemTagSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

const RecipeTypeSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

const RecipeSlotTypeSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

const RecipeTagTypeSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

const RecipeInputSchema = z.object({
	item: ItemRefSchema,
	slot: z.number().nullable(),
	slotType: RecipeSlotTypeSchema.nullable(),
});

const RecipeTagInputSchema = z.object({
	tag: RecipeTagTypeSchema,
	slot: z.number().nullable(),
	slotType: RecipeSlotTypeSchema.nullable(),
});

export const RecipeSchema = z.object({
	id: z.number(),
	type: RecipeTypeSchema,
	resultCount: z.number(),
	experience: z.number().nullable(),
	cookingTime: z.number().nullable(),
	inputs: z.array(RecipeInputSchema),
	tagInputs: z.array(RecipeTagInputSchema),
});

export const ItemSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	num: z.number().nullable(),
	desc: z.string().nullable(),
	shortDesc: z.string().nullable(),
	generation: z.number().nullable(),
	namespace: NamespaceRefSchema.nullable(),
	implemented: z.boolean(),
	boosts: z.array(ItemBoostSchema),
	flags: z.array(ItemFlagSchema),
	tags: z.array(ItemTagSchema),
	recipes: z.array(RecipeSchema),
});
