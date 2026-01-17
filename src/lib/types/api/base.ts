import { z } from 'zod';

export const RefSchema = z.object({
	id: z.number(),
	name: z.string()
});

export const NamedRefSchema = RefSchema.extend({
	slug: z.string()
});

export const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		data: z.array(itemSchema),
		total: z.number(),
		limit: z.number(),
		offset: z.number()
	});
