import { error } from '@sveltejs/kit';
import type { z } from 'zod';

export async function parseResponse<T>(
	res: Response,
	schema: z.ZodType<T>,
	errorMessage = 'Invalid API response'
): Promise<T> {
	const json = await res.json();
	const parsed = schema.safeParse(json);
	if (!parsed.success) {
		console.error('API validation failed:', parsed.error.flatten());
		throw error(500, errorMessage);
	}
	return parsed.data;
}
