import type { ApiResponse } from './types';

type Schema<T> = {
	safeParse: (data: unknown) => { success: true; data: T } | { success: false };
};

export function validate<T>(result: ApiResponse<unknown>, schema: Schema<T>): ApiResponse<T> {
	if (!result.ok) return result;
	const parsed = schema.safeParse(result.data);
	if (!parsed.success) {
		return { ok: false, status: 500, message: 'Invalid response format' };
	}
	return { ok: true, data: parsed.data };
}
