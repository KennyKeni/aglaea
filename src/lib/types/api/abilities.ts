import { z } from 'zod';
import { FormRefSchema } from './base';

export const AbilityFlagSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

export const AbilitySchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	desc: z.string().nullable(),
	shortDesc: z.string().nullable(),
	flags: z.array(AbilityFlagSchema),
	forms: z.array(FormRefSchema),
});
