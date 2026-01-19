import { z } from 'zod';
import { NamedRefSchema } from './base';

export const ArticleCategorySchema = NamedRefSchema.extend({
  description: z.string().nullable(),
});

export const ArticleImageSchema = z.object({
  imageId: z.string(),
  url: z.string(),
  mimeType: z.string().nullable(),
  isCover: z.boolean(),
  sortOrder: z.number(),
});

export const ArticleAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
});

const TiptapNodeSchema: z.ZodType<TiptapNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    content: z.array(TiptapNodeSchema).optional(),
    text: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
  }),
);

export interface TiptapNode {
  type: string;
  content?: TiptapNode[] | undefined;
  text?: string | undefined;
  attrs?: {
    level?: number;
    [key: string]: unknown;
  } | undefined;
}

export const TiptapDocSchema = TiptapNodeSchema;

export const ArticleSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  content: TiptapDocSchema.nullable(),
  ownerId: z.string().nullable(),
  author: ArticleAuthorSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  categories: z.array(ArticleCategorySchema),
  images: z.array(ArticleImageSchema),
});

export const ArticleMutationResponseSchema = z.object({
  id: z.number(),
  slug: z.string(),
});

export const ArticleDeleteResponseSchema = z.object({
  success: z.boolean(),
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleCategory = z.infer<typeof ArticleCategorySchema>;
export type ArticleImage = z.infer<typeof ArticleImageSchema>;
export type ArticleAuthor = z.infer<typeof ArticleAuthorSchema>;
export type TiptapDoc = z.infer<typeof TiptapDocSchema>;
export type ArticleMutationResponse = z.infer<typeof ArticleMutationResponseSchema>;
export type ArticleDeleteResponse = z.infer<typeof ArticleDeleteResponseSchema>;
