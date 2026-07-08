import { describe, expect, it } from 'vitest';
import { Type } from '@sinclair/typebox';
import { validateTypeBox } from './validate';
import type { ApiResponse } from './types';

function ok(data: unknown): ApiResponse<unknown> {
  return { ok: true, data };
}

describe('validateTypeBox', () => {
  const Schema = Type.Object({ id: Type.Integer(), name: Type.String() });

  it('accepts a well-formed payload', () => {
    const result = validateTypeBox(ok({ id: 1, name: 'Bulbasaur' }), Schema, 'pokemon');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).toBe('Bulbasaur');
  });

  it('rejects an invalid payload with a first-error detail', () => {
    const result = validateTypeBox(ok({ id: 'not-a-number', name: 'Bad' }), Schema, 'pokemon');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(500);
      expect(result.message).toContain('pokemon');
      expect(result.message).toContain('/id');
    }
  });

  it('passes through non-ok responses untouched', () => {
    const result = validateTypeBox(
      { ok: false, status: 503, message: 'upstream down' },
      Schema,
      'pokemon',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(503);
      expect(result.message).toBe('upstream down');
    }
  });

  it('does not use code generation (no globalThis.Function / TypeCompiler)', () => {
    const originalFunction = globalThis.Function;
    let touched = false;
    try {
      Object.defineProperty(globalThis, 'Function', {
        configurable: true,
        get: () => {
          touched = true;
          return originalFunction;
        },
      });
      const valid = validateTypeBox(ok({ id: 1, name: 'Bulbasaur' }), Schema, 'pokemon');
      expect(valid.ok).toBe(true);
      const invalid = validateTypeBox(ok({ id: 'x', name: 1 }), Schema, 'pokemon');
      expect(invalid.ok).toBe(false);
    } finally {
      Object.defineProperty(globalThis, 'Function', {
        configurable: true,
        value: originalFunction,
        writable: true,
      });
    }
    expect(touched).toBe(false);
  });
});
