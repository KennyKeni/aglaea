import { describe, expect, it } from 'vitest';
import { createItemEndpoint, buildSearchQuery } from './items';
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

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: 'oran-berry',
    name: 'Oran Berry',
    num: 1,
    desc: null,
    shortDesc: null,
    generation: 3,
    namespace: { id: 1, slug: 'cobblemon', name: 'Cobblemon' },
    implemented: true,
    boosts: [],
    flags: [],
    tags: [{ id: 1, slug: 'berries', name: 'Berries' }],
    recipes: [],
    ...overrides,
  };
}

function makeItemList() {
  return {
    data: [makeItem()],
    total: 1,
    limit: 24,
    offset: 0,
  };
}

describe('createItemEndpoint', () => {
  describe('search (item list)', () => {
    it('validates a well-formed item list response', async () => {
      const list = makeItemList();
      const client = fakeClient(async () => ok(list));
      const api = createItemEndpoint(client);

      const result = await api.search({ limit: 24, offset: 0 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toHaveLength(1);
        expect(result.data.data[0]?.name).toBe('Oran Berry');
        expect(result.data.total).toBe(1);
      }
    });

    it('returns an error for an invalid item list payload', async () => {
      const client = fakeClient(async () => ok({ data: [], total: 1 }));
      const api = createItemEndpoint(client);

      const result = await api.search();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('item list');
      }
    });

    it('propagates upstream errors unchanged', async () => {
      const client = fakeClient(async () => err(503, 'upstream down'));
      const api = createItemEndpoint(client);

      const result = await api.search();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(503);
        expect(result.message).toBe('upstream down');
      }
    });
  });

  describe('getById (item detail)', () => {
    it('validates a well-formed item detail response', async () => {
      const detail = makeItem({ generation: null, namespace: null });
      const client = fakeClient(async () => ok(detail));
      const api = createItemEndpoint(client);

      const result = await api.getById('oran-berry');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.name).toBe('Oran Berry');
        expect(result.data.namespace).toBeNull();
      }
    });

    it('returns an error for an invalid item detail payload', async () => {
      const client = fakeClient(async () => ok({ id: 'not-a-number', name: 'Bad' }));
      const api = createItemEndpoint(client);

      const result = await api.getById(1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('item detail');
      }
    });
  });
});

describe('buildSearchQuery', () => {
  it('serializes name, limit, and offset', () => {
    const q = buildSearchQuery({ name: 'oran', limit: 24, offset: 48 });
    expect(q.get('name')).toBe('oran');
    expect(q.get('limit')).toBe('24');
    expect(q.get('offset')).toBe('48');
  });

  it('repeats tagSlugs for each tag', () => {
    const q = buildSearchQuery({ tagSlugs: ['berries', 'food'] });
    expect(q.getAll('tagSlugs')).toEqual(['berries', 'food']);
  });

  it('omits unset optional params', () => {
    const q = buildSearchQuery({ limit: 24 });
    expect(q.has('name')).toBe(false);
    expect(q.has('tagSlugs')).toBe(false);
  });
});
