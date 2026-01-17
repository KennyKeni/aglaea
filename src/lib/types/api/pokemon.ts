import { z } from 'zod';

export const FormSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		fullName: z.string(),
		slug: z.string(),
		description: z.string().nullable(),
		generation: z.number().nullable(),
		height: z.number(),
		weight: z.number(),
		catchRate: z.number(),
		baseFriendship: z.number(),
		eggCycles: z.number(),
		maleRatio: z.number().nullable(),
		baseScale: z.number().nullable(),
		baseHp: z.number(),
		baseAttack: z.number(),
		baseDefence: z.number(),
		baseSpecialAttack: z.number(),
		baseSpecialDefence: z.number(),
		baseSpeed: z.number(),
		baseExperienceYield: z.number().nullable(),
		evHp: z.number(),
		evAttack: z.number(),
		evDefence: z.number(),
		evSpecialAttack: z.number(),
		evSpecialDefence: z.number(),
		evSpeed: z.number(),
		labels: z.array(z.unknown()),
		aspectChoices: z.array(z.unknown()),
		types: z.array(z.unknown()),
		abilities: z.array(z.unknown()),
		moves: z.array(z.unknown()),
		hitbox: z.unknown().nullable(),
		drops: z.unknown().nullable(),
		aspectCombos: z.array(z.unknown()),
		behaviour: z.unknown().nullable(),
		spawns: z.array(z.unknown())
	});

export const ExperienceGroupSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	formula: z.string()
});

export const PokemonSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		slug: z.string(),
		description: z.string().nullable(),
		generation: z.number(),
		experienceGroup: ExperienceGroupSchema.nullable(),
		eggGroups: z.array(z.unknown()),
		hitbox: z.unknown().nullable(),
		lighting: z.unknown().nullable(),
		riding: z.unknown().nullable(),
		forms: z.array(FormSchema)
	});
