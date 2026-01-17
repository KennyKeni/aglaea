import { z } from 'zod';

export interface TiptapDoc {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapDoc[];
}

export const TiptapDocSchema: z.ZodType<TiptapDoc> = z.lazy(() =>
  z.object({
    type: z.string(),
    text: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(TiptapDocSchema).optional(),
  }),
) as z.ZodType<TiptapDoc>;
