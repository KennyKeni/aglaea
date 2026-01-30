import { z } from 'zod';
import { FormRefSchema, NamedRefSchema } from './base';

const MoveCategorySchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

const MoveTargetSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

export const MoveFlagSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

const StatRefSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

export const MoveBoostSchema = z.object({
	stat: StatRefSchema,
	stages: z.number(),
	isSelf: z.boolean(),
});

const ConditionTypeSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
});

const ConditionSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	type: ConditionTypeSchema,
	description: z.string().nullable(),
});

export const MoveEffectSchema = z.object({
	conditionType: ConditionTypeSchema,
	condition: ConditionSchema.nullable(),
	chance: z.number(),
	isSelf: z.boolean(),
});

export const MoveZDataSchema = z.object({
	zPower: z.number().nullable(),
	zEffect: z.string().nullable(),
	zCrystal: z.string().nullable(),
	isZExclusive: z.boolean(),
});

export const MoveSchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	desc: z.string().nullable(),
	shortDesc: z.string().nullable(),
	type: NamedRefSchema,
	category: MoveCategorySchema,
	target: MoveTargetSchema.nullable(),
	power: z.number().nullable(),
	accuracy: z.number().nullable(),
	pp: z.number(),
	priority: z.number(),
	critRatio: z.number().nullable(),
	minHits: z.number().nullable(),
	maxHits: z.number().nullable(),
	drainPercent: z.number().nullable(),
	healPercent: z.number().nullable(),
	recoilPercent: z.number().nullable(),
	flags: z.array(MoveFlagSchema),
	boosts: z.array(MoveBoostSchema),
	effects: z.array(MoveEffectSchema),
	maxPower: z.number().nullable(),
	zData: MoveZDataSchema.nullable(),
	gmaxSpecies: z.array(NamedRefSchema),
	forms: z.array(FormRefSchema),
});
