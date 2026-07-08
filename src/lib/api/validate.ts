import type { ApiResponse } from './types';
import { Value } from '@sinclair/typebox/value';
import type { Static, TSchema } from '@sinclair/typebox';

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

function firstErrorDetail(errors: Iterable<{ path: string; message: string }>): string | undefined {
  for (const err of errors) {
    const path = err.path || '(root)';
    const reason = err.message || 'validation failed';
    return `${path}: ${reason}`;
  }
  return undefined;
}

export function validateTypeBox<T extends TSchema>(
  result: ApiResponse<unknown>,
  schema: T,
  label: string,
): ApiResponse<Static<T>> {
  if (!result.ok) return result;
  if (Value.Check(schema, result.data)) {
    return { ok: true, data: result.data as Static<T> };
  }
  const detail = firstErrorDetail(Value.Errors(schema, result.data));
  const message = detail
    ? `Invalid response format for ${label}: ${detail}`
    : `Invalid response format for ${label}`;
  return { ok: false, status: 500, message };
}
