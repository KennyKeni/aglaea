import { describe, expect, it } from 'vitest';
import { createAbilityEndpoint, buildSearchQuery } from './abilities';
import type { ApiResponse } from '$lib/api/types';
import type { ServerClient } from '../client';

type GetReturn = Promise<ApiResponse<unknown>>;
type GetFn = (path: string, query?: URLSearchParams) => GetReturn;

function fakeClient(get: GetFn): Pick<ServerClient, 'get'> {
  return { get: get as ServerClient['get'] };
}

function ok(data: unknown): ApiResponse<unknown> {
  return { ok: true, data };
}

function err(status: number, message: string): ApiResponse<unknown> {
  return { ok: false, status, message };
}

const formRef = (id: number, name: string, slug: string, speciesId: number) => ({
  id,
  name,
  slug,
  speciesId,
});

function makeAbility(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Overgrow',
    slug: 'overgrow',
    desc: null,
    shortDesc: null,
    flags: [],
    forms: [],
    ...overrides,
  };
}

function makeAbilityList() {
  return {
    data: [makeAbility()],
    total: 1,
    limit: 24,
    offset: 0,
  };
}

describe('createAbilityEndpoint', () => {
  describe('search (ability list)', () => {
    it('validates a well-formed ability list response', async () => {
      const list = makeAbilityList();
      const client = fakeClient(async () => ok(list));
      const api = createAbilityEndpoint(client);

      const result = await api.search({ limit: 24, offset: 0 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toHaveLength(1);
        expect(result.data.data[0]?.name).toBe('Overgrow');
        expect(result.data.total).toBe(1);
      }
    });

    it('returns an error for an invalid ability list payload', async () => {
      const client = fakeClient(async () => ok({ data: [], total: 1 }));
      const api = createAbilityEndpoint(client);

      const result = await api.search();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('ability list');
      }
    });

    it('propagates upstream errors unchanged', async () => {
      const client = fakeClient(async () => err(503, 'upstream down'));
      const api = createAbilityEndpoint(client);

      const result = await api.search();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(503);
        expect(result.message).toBe('upstream down');
      }
    });
  });

  describe('getById (ability detail)', () => {
    it('validates a well-formed ability detail response', async () => {
      const detail = makeAbility({
        forms: [formRef(1, 'Bulbasaur-Normal', 'bulbasaur-normal', 1)],
      });
      const client = fakeClient(async () => ok(detail));
      const api = createAbilityEndpoint(client);

      const result = await api.getById('overgrow');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.name).toBe('Overgrow');
        expect(result.data.forms[0]?.speciesId).toBe(1);
      }
    });

    it('returns an error for an invalid ability detail payload', async () => {
      const client = fakeClient(async () => ok({ id: 'not-a-number', name: 'Bad' }));
      const api = createAbilityEndpoint(client);

      const result = await api.getById(1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('ability detail');
      }
    });
  });
});

describe('buildSearchQuery', () => {
  it('serializes name, limit, and offset', () => {
    const q = buildSearchQuery({ name: 'over', limit: 24, offset: 48 });
    expect(q.get('name')).toBe('over');
    expect(q.get('limit')).toBe('24');
    expect(q.get('offset')).toBe('48');
  });

  it('repeats flagSlugs for each flag', () => {
    const q = buildSearchQuery({ flagSlugs: ['contact', 'protect'] });
    expect(q.getAll('flagSlugs')).toEqual(['contact', 'protect']);
  });

  it('omits unset optional params', () => {
    const q = buildSearchQuery({ limit: 24 });
    expect(q.has('name')).toBe(false);
    expect(q.has('flagSlugs')).toBe(false);
  });
});
