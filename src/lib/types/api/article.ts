import { z } from 'zod';
import { NamedRefSchema } from './base';

export const ArticleCategorySchema = NamedRefSchema;

export const ArticleImageSchema = z.object({
	id: z.number(),
	url: z.string(),
	isCover: z.boolean()
});

export const ArticleSchema = z.object({
	id: z.number(),
	slug: z.string(),
	title: z.string(),
	subtitle: z.string().nullable(),
	description: z.string().nullable(),
	body: z.string(),
	bodyHtml: z.string().optional(),
	author: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	categories: z.array(ArticleCategorySchema),
	images: z.array(ArticleImageSchema)
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleCategory = z.infer<typeof ArticleCategorySchema>;
export type ArticleImage = z.infer<typeof ArticleImageSchema>;
