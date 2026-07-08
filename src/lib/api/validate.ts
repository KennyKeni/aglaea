import type { ApiResponse } from './types';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import type { Static, TSchema } from '@sinclair/typebox';
import type { ValueError } from '@sinclair/typebox/errors';

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

function firstErrorDetail(errors: Iterable<ValueError>): string | undefined {
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
  const check = TypeCompiler.Compile(schema);
  if (check.Check(result.data)) {
    return { ok: true, data: result.data as Static<T> };
  }
  const detail = firstErrorDetail(check.Errors(result.data));
  const message = detail
    ? `Invalid response format for ${label}: ${detail}`
    : `Invalid response format for ${label}`;
  return { ok: false, status: 500, message };
}
